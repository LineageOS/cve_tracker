#!/usr/bin/python3
import base64
import datetime
import functools
import json
import math
import operator
import os
import re
import subprocess
import sys

import utils

import flask_debugtoolbar
import flask_debugtoolbar_mongo

from classes import *
from flask import Flask, abort, jsonify, redirect, render_template, request, session, url_for
from flask_github import GitHub
from flask_mongoengine import MongoEngine

devicefile = "kernels.json"
forceDBUpdate = False

version = subprocess.check_output(["git", "describe", "--always"],
    cwd=os.path.dirname(os.path.realpath(__file__))).decode('utf-8')
app = Flask(__name__)
app.config.from_pyfile('app.cfg')
app.secret_key = app.config['SECRET_KEY']
if app.secret_key == 'default':
    raise Exception("You need to set the secret key!")

app.jinja_env.auto_reload = True
app.config['TEMPLATES_AUTO_RELOAD'] = True

dir = os.path.dirname(__file__)

with open(os.path.join(dir, devicefile)) as device_file:
    devices = json.load(device_file)

db = MongoEngine(app)
github = GitHub(app)

app.config['DEBUG_TB_PANELS'] = [
    'flask_debugtoolbar.panels.versions.VersionDebugPanel',
    'flask_debugtoolbar.panels.timer.TimerDebugPanel',
    'flask_debugtoolbar.panels.headers.HeaderDebugPanel',
    'flask_debugtoolbar.panels.request_vars.RequestVarsDebugPanel',
    'flask_debugtoolbar.panels.template.TemplateDebugPanel',
    'flask_debugtoolbar.panels.logger.LoggingPanel',
    'flask_debugtoolbar.panels.profiler.ProfilerDebugPanel',
    # Add the MongoDB panel
    'flask_debugtoolbar_mongo.panel.MongoDebugPanel',
]

toolbar = flask_debugtoolbar.DebugToolbarExtension(app)

# Ensure status descriptions are in sync with statuses.txt
utils.updateStatusDescriptions()

# Get the translation for logging actions
logTrans = utils.getLogTranslations()

@app.cli.command()
def update_progress():
    for k in Kernel.objects():
        k.progress = utils.getProgress(k.id)
        k.save()

@app.cli.command()
def update_kernels():
    utils.getKernelTableFromGithub()

@app.context_processor
def template_dict():
    templateDict = {}
    templateDict["authorized"] = logged_in()
    templateDict["needs_auth"] = needs_auth()
    templateDict["version"] = version
    return templateDict

def logged_in():
    return ('github_token' in session and session['github_token']) or not needs_auth()

def needs_auth():
    return app.config['GITHUB_ORG'] != None

def show_last_update():
    return 'SHOW_LAST_UPDATE' in app.config and app.config['SHOW_LAST_UPDATE'] == True

def logs_per_page():
    if 'LOGS_PER_PAGE' in app.config:
        return app.config['LOGS_PER_PAGE']
    else:
        return 50

def require_login(f):
    @functools.wraps(f)
    def wrapper(*args, **kwargs):
        if not logged_in():
            return jsonify({'error': 'not logged in'})
        return f(*args, **kwargs)
    return wrapper

@app.route("/login")
def login():
    if 'github_token' not in session or not session['github_token']:
        return github.authorize(scope="user:email, read:org")
    else:
        return redirect(url_for('index'))
    return response

@app.route('/login/authorized')
@github.authorized_handler
def authorized(access_token):
    next_url = request.args.get('next') or url_for('index')
    if access_token is None:
        return redirect(next_url)
    req = github.raw_request("GET", "user/orgs", access_token=access_token)
    orgs = []
    if req.status_code == 200:
        orgs = [x['login'] for x in req.json()]
    if app.config['GITHUB_ORG'] in orgs:
        session['github_token'] = access_token
        getUsername(access_token)
        return redirect(next_url)
    elif len(orgs) == 0:
        msg = 'Couldn\'t find a GitHub membership in \'{}\''
        formatted = msg.format(app.config['GITHUB_ORG'])
    else:
        msg = ('Couldn\'t find a GitHub membership in \'{}\', only found these: {}')
        formatted = msg.format(app.config['GITHUB_ORG'], ', '.join(orgs))
    return error(formatted)

def getUsername(access_token = None):
    if access_token != None:
        req = github.raw_request("GET", "user", access_token=access_token)

        if req.status_code == 200:
            data = req.json()
            if 'login' in data:
                session['username'] = data['login']

    if 'username' not in session:
        session['username'] = ''

    return session['username']

@app.route("/logout")
def logout():
    session.pop('github_token', None)
    return redirect(url_for('index'))

@github.access_token_getter
def get_github_token():
    return session.get('github_token')

@app.route("/secure")
@require_login
def secure():
    return "logged in"

@app.errorhandler(404)
def page_not_found(error):
    msg = "The requested page could not be found!"
    return render_template('error.html', msg=msg, errorCode=404), 404

def error(msg = ""):
    return render_template('error.html', msg=msg)

def show_kernels(deprecated):
    if not deprecated:
        deprecated_status = [False, None]
        template = "kernels.html"
    else:
        deprecated_status = [True]
        template = "deprecated.html"

    kernels = Kernel.objects(deprecated__in=deprecated_status).order_by('vendor', 'device')
    return render_template(template, kernels=kernels)

@app.route("/")
def index():
    if logged_in():
        return show_kernels(False)
    else:
        return render_template('index.html')

@app.route("/kernels")
def kernels():
    return show_kernels(False)

@app.route("/deprecated")
def show_deprecated():
    return show_kernels(True)

@app.route("/devices")
def show_devices():
    devs = []
    for kernelRepo, deviceRepos in devices.items():
        try:
            kernel = Kernel.objects.get(repo_name=kernelRepo)
        except:
            continue

        if kernel["deprecated"]:
            continue

        for repo in deviceRepos:
            vendor, device = utils.getVendorNameFromRepo(repo)
            devs.append({
            'vendor': vendor,
            'device': device,
            'kernel': kernelRepo,
            'progress': kernel["progress"]
            })
    devs.sort(key=operator.itemgetter('vendor', 'device'))
    return render_template('devices.html', devices=devs)

@app.route("/<string:k>")
def kernel(k):
    try:
        kernel = Kernel.objects.get(repo_name=k)
    except:
        return error("The requested kernel could not be found!");

    get_tags = request.args.get('tags')
    err, filter_tags = processTags(get_tags, True)

    cves = CVE.objects().order_by('cve_name')
    statuses = {s.id: s.short_id for s in Status.objects()}
    all_kernels = {k.repo_name for k in Kernel.objects(deprecated__in=[False, None])}
    patches = {p.cve: p.status for p in Patches.objects(kernel=kernel.id)}
    patch_status = {}

    if kernel.tags:
        available_tags = list(kernel.tags)
    else:
        available_tags = []
    available_tags.append('none')
    filtered_cves = []
    for cve in cves:
        if not cve.tags:
            cve.tags = []
        if len(filter_tags) == 0 or 'none' in filter_tags and len(cve.tags) == 0:
            filtered_cves.append(cve)
        for tag in cve.tags:
            if tag in filter_tags and not cve in filtered_cves:
                filtered_cves.append(cve)
            if not tag in available_tags:
                available_tags.append(tag)
        patch_status[cve.id] = statuses[patches[cve.id]]

    if k in devices:
        devs = []
        for repo in devices[k]:
            v, d = utils.getVendorNameFromRepo(repo)
            devs.append({
            'name': d,
            'repo': repo
            })
    else:
        devs = []

    return render_template('kernel.html',
                           kernel = kernel,
                           allKernels = sorted(all_kernels),
                           cves = filtered_cves,
                           patch_status = patch_status,
                           all_tags = sorted(available_tags),
                           selected_tags = sorted(filter_tags),
                           status_ids = Status.objects(),
                           patches = patches,
                           devices = devs,
                           show_last_update=show_last_update())

@app.route("/import_statuses", methods=['POST'])
def import_statuses():
    errstatus = "Generic error"
    r = request.get_json()
    from_kernel_repo = r['from_kernel']
    to_kernel_repo = r['to_kernel']
    override_all = r['override_all']

    try:
        from_kernel = Kernel.objects.get(repo_name=from_kernel_repo).id
        to_kernel = Kernel.objects.get(repo_name=to_kernel_repo).id
        statuses = {s.id: s.short_id for s in Status.objects()}

        for patch in Patches.objects(kernel=from_kernel):
            target_patch = Patches.objects.get(kernel=to_kernel, cve=patch.cve)
            if override_all or statuses[target_patch.status] == 1:
                target_patch.update(status=patch.status)

        progress = utils.getProgress(to_kernel)
        Kernel.objects(id=to_kernel).update(progress=progress)
        writeLog("imported", to_kernel, to_kernel_repo)
        errstatus = "success"
    except:
        errstatus = "Invalid kernels!"

    return jsonify({'error': errstatus})

@app.route("/status/<string:c>")
def cve_status(c):
    kernels = Kernel.objects(deprecated__in=[False, None]).order_by('vendor', 'device')
    cve = CVE.objects.get(cve_name=c)
    statuses = {s.id: s.short_id for s in Status.objects()}
    patches = {p.kernel: p.status for p in Patches.objects(cve=cve.id)}
    return render_template('status.html',
                           cve_name = c,
                           kernels = kernels,
                           patches = patches,
                           status_ids = Status.objects(),
                           statuses = statuses)

@app.route("/update", methods=['POST'])
@require_login
def update():
    r = request.get_json()
    k = r['kernel_id'];
    c = r['cve_id'];
    s = r['status_id'];

    status = Status.objects.get(short_id=s)
    Patches.objects(kernel=k, cve=c).update(status=status.id)
    progress = utils.getProgress(k)
    Kernel.objects(id=k).update(progress=progress)
    cveName = CVE.objects.get(id=c)['cve_name']
    writeLog("patched", k, cveName + ": " + status.text)
    return jsonify({'error': 'success', 'progress': progress})


@app.route("/addcve", methods=['POST'])
@require_login
def addcve():
    errstatus = None
    r = request.get_json()
    cve = r['cve_id']
    notes = r['cve_notes']
    tags = r['cve_tags']
    # Match CVE-1990-0000 to CVE-2999-##### (> 4 digits), to ensure at least a little sanity
    pattern = re.compile("^(CVE|LVT)-(199\d|2\d{3})-(\d{4}|[1-9]\d{4,})$")

    errstatus, cveTags = processTags(tags)

    if not cve:
        errstatus = "No CVE specified!"
    elif not pattern.match(cve):
        errstatus = "CVE '" + cve + "' is invalid!"
    elif CVE.objects(cve_name=cve):
        errstatus = cve + " already exists!"
    elif not notes or len(notes) < 10:
        errstatus = "Notes have to be at least 10 characters!";
    elif not errstatus:
        CVE(cve_name=cve, notes=notes, tags=cveTags).save()
        cve_id = CVE.objects.get(cve_name=cve)['id']
        status_id = Status.objects.get(short_id=1)['id']
        for k in Kernel.objects():
            Patches(cve=cve_id, kernel=k.id, status=status_id).save()
            k.progress = utils.getProgress(k.id)
            k.save()
        # add a mitre link for non-internal CVEs
        if not cve.startswith("LVT"):
            mitrelink = 'https://cve.mitre.org/cgi-bin/cvename.cgi?name='
            Links(cve_id=cve_id, link=mitrelink+cve).save()
        msg = "Name: '{}', Notes: '{}', Tags: '{}'"
        logStr = msg.format(cve, notes, tags)
        writeLog("cve_add", cve_id, logStr)
        errstatus = "success"

    if not errstatus:
        errstatus = "Generic error"

    return jsonify({'error': errstatus})

@app.route("/addkernel", methods=['POST'])
@require_login
def addkernel():
    errstatus = None
    r = request.get_json()
    kernel = r['kernel']
    t = r['tags']

    errstatus, tags = processTags(t)

    if not kernel:
        errstatus = "No kernel name specified!"
    elif not errstatus:
        if Kernel.objects(repo_name=kernel):
            errstatus = "'" + kernel + "' already exists!"
        else:
            v, n = utils.getVendorNameFromRepo(kernel)
            if v is "error" or n is "error":
                errstatus = "'" + kernel + "' is invalid!"
            else:
                utils.addKernel(kernel, tags)
                k = Kernel.objects.get(repo_name=kernel)['id']
                msg = "Kernel: '{}', Tags: '{}'"
                logStr = msg.format(kernel, tags)
                writeLog("kernel_add", k, logStr)
                errstatus = "success"

    if not errstatus:
        errstatus = "Generic error"

    return jsonify({'error': errstatus})

@app.route("/editkerneltags", methods=['POST'])
@require_login
def editkerneltags():
    errstatus = None
    r = request.get_json()
    k = r['kernel_id']
    t = r['tags']

    errstatus, tags = processTags(t)

    if not k or not Kernel.objects(id=k):
        errstatus = "Kernel is invalid!"
    elif not errstatus:
        Kernel.objects(id=k).update(tags=tags)
        msg = "New tags: '{}'"
        logStr = msg.format(t)
        writeLog("tag_edit", k, logStr)
        errstatus = "success"

    if not errstatus:
        errstatus = "Generic error"

    return jsonify({'error': errstatus})

@app.route("/editcve/<string:cvename>")
@require_login
def editcve(cvename = None):
    if cvename and CVE.objects(cve_name=cvename):
        cve = CVE.objects.get(cve_name=cvename)
        return render_template('editcve.html',
                               cve=cve,
                               links=Links.objects(cve_id=cve['id']))
    else:
        errmsg = "CVE '{}' is invalid or doesn't exist!"
        msg = errmsg.format(cvename)
        return error(msg)

@app.route("/deletecve/<string:cvename>")
@require_login
def deletecve(cvename = None):
    if cvename and CVE.objects(cve_name=cvename):
        utils.nukeCVE(cvename)
        writeLog("cve_delete", None, cvename)
        return render_template('deletedcve.html', cve_name=cvename)
    else:
        errmsg = "CVE '{}' is invalid or doesn't exist!"
        msg = errmsg.format(cvename)
        return error(msg)

@app.route("/resetcve/<string:cvename>")
@require_login
def resetcve(cvename = None):
    if cvename and CVE.objects(cve_name=cvename):
        cve_id = CVE.objects.get(cve_name=cvename).id
        status_id = Status.objects.get(short_id=6).id
        writeLog("cve_reset", cve_id, cvename)
        for k in Kernel.objects():
            Patches.objects(cve=cve_id, kernel=k.id).update(status=status_id)
            k.progress = utils.getProgress(k.id)
            k.save()
        return render_template('resetcve.html', cve_name=cvename)
    else:
        errmsg = "CVE '{}' is invalid or doesn't exist!"
        msg = errmsg.format(cvename)
        return error(msg=msg)

@app.route("/addlink", methods=['POST'])
@require_login
def addlink():
    errstatus = "Generic error"
    link_id = ""
    r = request.get_json()
    c = r['cve_id']
    l = r['link_url']
    d = r['link_desc']

    if not c or not CVE.objects(id=c):
        errstatus = "CVE doesn't exist"
    elif not l or not utils.isValidUrl(l):
        errstatus = "Link is invalid!"
    elif Links.objects(cve_id=c, link=l):
        errstatus = "Link already exists!"
    else:
        Links(cve_id=c, link=l, desc=d).save()
        link_id = Links.objects.get(cve_id=c, link=l)['id']
        writeLog("link_add", c, l + ' - ' + d)
        errstatus = "success"

    return jsonify({'error': errstatus, 'link_id': str(link_id)})

@app.route("/deletelink", methods=['POST'])
@require_login
def deletelink():
    errstatus = "Generic error"
    r = request.get_json()
    linkId = r['link_id']

    if linkId and Links.objects(id=linkId):
        data = Links.objects.get(id=linkId)
        linkUrl = data['link']
        linkDesc = data['desc']
        linkCve = data['cve_id']
        Links.objects(id=linkId).delete()
        msg = "Url: '{}', Desciption: '{}'"
        logStr = msg.format(linkUrl, linkDesc)
        writeLog("link_delete", linkCve, logStr)
        errstatus = "success"
    else:
        errstatus = "Link doesn't exist"

    return jsonify({'error': errstatus})

@app.route("/editcvedata", methods=['POST'])
@require_login
def editcvedata():
    errstatus = None
    r = request.get_json()
    c = r['cve_id']
    n = r['cve_notes']
    t = r['cve_tags'].strip()

    errstatus, tags = processTags(t)

    if not n or len(n) < 10:
        errstatus = "Notes have to be at least 10 characters!";
    elif not errstatus:
        if c and CVE.objects(id=c):
            CVE.objects(id=c).update(set__notes=n)
            if len(tags) > 0:
                CVE.objects(id=c).update(set__tags=tags)
            else:
                CVE.objects(id=c).update(unset__tags=1)
            msg = "Notes: '{}', Tags: '{}'"
            logStr = msg.format(n, t)
            writeLog("cve_edit", c, logStr)
            errstatus = "success"
        else:
            errstatus = "CVE doesn't exist"

    if not errstatus:
        errstatus = "Generic error"

    return jsonify({'error': errstatus})

@app.route("/editlink", methods=['POST'])
@require_login
def editlink():
    errstatus = "Generic error"
    r = request.get_json()
    linkId = r['link_id']
    url = r['link_url']
    desc = r['link_desc']

    if linkId and Links.objects(id=linkId):
        cveId = Links.objects.get(id=linkId)['cve_id']
        oldUrl = Links.objects.get(id=linkId)['link']
        oldDesc = Links.objects.get(id=linkId)['desc']
        Links.objects(id=linkId).update(set__link=url, set__desc=desc)

        msg = "From: '{}' - '{}', To: '{}' - '{}'"
        logStr = msg.format(oldUrl, oldDesc, url, desc)
        writeLog("link_edit", cveId, logStr);

        errstatus = "success"
    else:
        errstatus = "Link doesn't exist"

    return jsonify({'error': errstatus})

@app.route("/getlinks", methods=['POST'])
def getlinks():
    r = request.get_json()
    c = r['cve_id'];
    return Links.objects(cve_id=c).to_json()

@app.route("/api/cves")
def get_cves():
    obj = {}
    for el in CVE.objects():
        obj[el.cve_name] = {'notes': el.notes, 'links': []}
        links = Links.objects(cve_id=el.id)
        for link in links:
            obj[el.cve_name]['links'].append({'link': link.link, 'desc': link.desc})
    return jsonify(obj)

@app.route("/getcvedata", methods=['POST'])
def getcvedata():
    r = request.get_json()
    c = r['cve_id']
    return CVE.objects(id=c).to_json()

@app.route("/check/<string:k>/<string:c>")
def check(k, c):
    statusid = Patches.objects.get(kernel=Kernel.objects.get(repo_name=k).id,
                                   cve=CVE.objects.get(cve_name=c).id).status
    status = Status.objects.get(id=statusid).text
    return jsonify({'kernel': k, 'cve': c, 'status': status})

@app.route("/deprecate", methods=['POST'])
@require_login
def deprecate():
    r = request.get_json()
    k = r['kernel_id']
    d = r['deprecate']
    if d == 'True':
        new_state = False
    else:
        new_state = True
    Kernel.objects(id=k).update(deprecated=new_state)
    repo = Kernel.objects.get(id=k)['repo_name']
    writeLog("deprecated", k, repo + " - " + str(new_state))

    return jsonify({'error': "success"})

def processTags(tags, allowNone = False):
    errstatus = None
    processed = []

    if tags:
        for tag in tags.split(','):
            tag = tag.strip()
            if len(tag) == 0:
                continue
            elif len(tag) <= 3 or tag == 'none' and not allowNone:
                errstatus = tag + " is an invalid tag!"
            elif not tag in processed:
                processed.append(tag)
    return errstatus, processed

def writeLog(action, affectedId, result=None):
    Log(user=getUsername(), action=action, dateAndTime=datetime.datetime.now(),
        affectedId=affectedId, result=result).save()

@app.route("/logs/")
@require_login
def logs():
    actions = ['kernel_add', 'cve_add', 'cve_delete', 'cve_reset', 'deprecated']
    return show_logs(None, actions, "")

@app.route("/logs/kernel/<string:k>")
@require_login
def kernel_logs(k):
    actions = ['imported', 'patched', 'tag_edit', 'deprecated', 'kernel_add', 'cve_reset']
    try:
        kernelId = Kernel.objects.get(repo_name=k).id
    except:
        return error("Kernel not found!")

    return show_logs(kernelId, actions, k)

@app.route("/logs/cve/<string:c>")
@require_login
def cve_logs(c):
    actions = ['cve_add', 'cve_edit', 'cve_reset', 'link_add', 'link_edit', 'link_delete']
    try:
        cveId = CVE.objects.get(cve_name=c).id
    except:
        return error("CVE not found!")

    return show_logs(cveId, actions, c)

def show_logs(affectedId, actions, title):
    p = request.args.get('page')
    if not p:
        page = 1
    else:
        page = int(p)
    perPage = logs_per_page()
    start = (page-1)*perPage
    end = start + perPage - 1
    if affectedId != None:
        count = Log.objects(affectedId=affectedId, action__in=actions).count()
        l = Log.objects(affectedId=affectedId,
            action__in=actions).order_by('-dateAndTime')[start:end]
    else:
        count = Log.objects(action__in=actions).order_by('-dateAndTime').count()
        l = Log.objects(action__in=actions).order_by('-dateAndTime')[start:end]

    pages = math.ceil(count / perPage)

    return render_template('logs.html',
                            title=title,
                            pages=pages,
                            logs=l,
                            logTranslations=logTrans,
                            needs_auth=needs_auth(),
                            authorized=logged_in())
