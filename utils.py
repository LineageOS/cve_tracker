#!/usr/bin/python3

import datetime
import urllib

from classes import *
from github import Github
from flask import Flask
from flask_mongoengine import MongoEngine

def isValidUrl(x):
    result = urllib.parse.urlparse(x)
    parts = result.netloc.split('.')
    if result.scheme and len(parts) >= 2:
        return True
    else:
        return False

def getVendorNameFromRepo(repo):
    v = "error"
    n = "error"

    if len(repo) == 0:
        return v, n

    parts = repo.split('_')
    partsLen = len(parts)
    if partsLen < 2:
        # lge-kernel-mako
        if len(repo.split('-')) >= 3:
            v = repo.split('-')[0]
            n = repo.split('-')[2]
    elif partsLen == 4:
        # android_kernel_samsung_manta
        v = parts[2]
        n = parts[3]
    elif partsLen >= 5:
        # android_device_sony_pollux_windy
        v = parts[2]
        n = '_'.join(parts[3:])

    return v, n

def getKernelTableFromGithub():
    print("Updating kernel list from github...this may take a long time...")

    app = Flask(__name__)
    app.config.from_pyfile('app.cfg')

    u = app.config['GITHUBUSER']
    p = app.config['GITHUBTOKEN']
    g = Github(u, p)

    org = g.get_organization(app.config['GITHUB_ORG'])

    for repo in org.get_repos():
        if "android_kernel_" in repo.name or "-kernel-" in repo.name:
            print(repo.name)
            if Kernel.objects(repo_name=repo.name).count() == 0:
                addKernel(repo.name, repo.updated_at)
            else:
                Kernel.objects(repo_name=repo.name).update(last_github_update=repo.updated_at)

    print("Done!")
    return

def addKernel(reponame, last_update=datetime.datetime.now()):
    v, n = getVendorNameFromRepo(reponame)
    if v is not "error" and n is not "error":
        Kernel(repo_name=reponame, last_github_update=last_update, vendor=v, device=n).save()
        for c in CVE.objects():
            Patches(cve=c.id, kernel=Kernel.objects.get(repo_name=reponame).id, status=Status.objects.get(short_id=1).id).save()

def nukeCVE(cve):
    if CVE.objects(cve_name=cve):
        cve_id = CVE.objects(cve_name=cve).first()['id']
        Patches.objects(cve=cve_id).delete()
        Links.objects(cve_id=cve_id).delete()
        CVE.objects(id=cve_id).delete()

def getProgress(kernel):
    cveCount = CVE.objects().count()
    patched = Patches.objects(kernel=kernel, status=Status.objects.get(short_id=2).id).count()
    unaffected = Patches.objects(kernel=kernel, status=Status.objects.get(short_id=3).id).count()

    if cveCount == unaffected:
        return 100

    return 100 * patched / (cveCount - unaffected)

def updateStatusDescriptions():
    f = open('statuses.txt')
    while True:
        x = f.readline().rstrip()
        if not x: break
        sid = x.split('|')[0]
        txt = x.split('|')[1]
        if Status.objects(short_id=sid).count() > 0:
            if not Status.objects(short_id=sid).first()['text'] == txt:
                Status.objects(short_id=sid).update(text=txt)
        else:
            Status(short_id=sid, text=txt).save()
