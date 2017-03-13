#!/usr/bin/python3

import json
import os
import subprocess
import sys

import utils

from classes import *
from flask import Flask, abort, jsonify, render_template, request
from flask_mongoengine import MongoEngine

devicefile = "kernels.json"
forceDBUpdate = False

app = Flask(__name__)
app.config.from_pyfile('app.cfg')

dir = os.path.dirname(__file__)

with open(os.path.join(dir, devicefile)) as device_file:
  devices = json.load(device_file)

db = MongoEngine(app)

def error(msg = ""):
    return render_template('error.html', msg=msg)

@app.route("/")
def index():
    kernels = Kernel.objects().order_by('vendor', 'device')
    version = subprocess.check_output(["git", "describe", "--always"])
    return render_template('index.html', kernels=kernels, version=version)

@app.route("/<string:k>")
def kernel(k):
    try:
        kernel = Kernel.objects.get(repo_name=k)
    except:
        abort(404)
    patches = Patches.objects(kernel=Kernel.objects.get(repo_name=k).id)
    patched = len(Patches.objects(kernel=Kernel.objects.get(repo_name=k).id, status=Status.objects.get(text='patched').id))
    if k in devices:
      devs = devices[k]
    else:
      devs = ['No officially supported devices!']
    return render_template('kernel.html',
                           kernel = kernel,
                           patched = patched,
                           cves = CVE.objects().order_by('cve_name'),
                           status_ids = Status.objects(),
                           patches = patches,
                           devices = devs)

@app.route("/update", methods=['POST'])
def update():
  r = request.get_json()
  k = r['kernel_id'];
  c = r['cve_id'];
  s = r['status_id'];

  Patches.objects(kernel=k, cve=c).update(status=Status.objects.get(short_id=s).id)
  patched = len(Patches.objects(kernel=k, status=Status.objects.get(text='patched').id))
  return jsonify({'error': 'success', 'patched': patched})

@app.route("/addcve")
@app.route("/addcve/<string:cve>")
def addcve(cve = None):
  if cve:
    if CVE.objects(cve_name=cve):
      msg = cve + " already exists!"
    elif cve[:3] != "CVE" or len(cve.split('-')) != 3:
      msg = cve + " is invalid!"
    else:
      CVE(cve_name=cve).save()
      cve_id = CVE.objects.get(cve_name=cve)['id']
      for k in Kernel.objects():
        Patches(cve=cve_id, kernel=k.id, status=Status.objects.get(short_id=1)['id']).save()
      mitrelink='https://cve.mitre.org/cgi-bin/cvename.cgi?name='
      Links(cve_id=cve_id, link=mitrelink+cve).save()
      msg = "Added " + cve + "!"

    return render_template('addcve.html', msg=msg)
  else:
    return render_template('addcve.html')

@app.route("/addkernel")
@app.route("/addkernel/<string:kernel>")
def addkernel(kernel = None):
  if kernel:
    if Kernel.objects(repo_name=kernel):
      msg = kernel + " already exists!"
    else:
      v, n = utils.getVendorNameFromRepo(kernel)
      if v is "error" or n is "error":
        msg = kernel + " is invalid!"
      else:
        utils.addKernel(kernel)
        msg = "Added " + kernel + "!"

    return render_template('addkernel.html', msg=msg)
  else:
    return render_template('addkernel.html')

@app.route("/editcve/<string:cvename>")
def editcve(cvename = None):
  if cvename and CVE.objects(cve_name=cvename):
    cve = CVE.objects.get(cve_name=cvename)
    return render_template('editcve.html',
                           cve=cve,
                           links=Links.objects(cve_id=cve['id']))
  else:
    msg = cvename + " is invalid or doesn't exist!"
    return render_template('editcve.html', msg=msg)

@app.route("/deletecve/<string:cvename>")
def deletecve(cvename = None):
  if cvename and CVE.objects(cve_name=cvename):
    utils.nukeCVE(cvename)
    return render_template('deletedcve.html', cve_name=cvename)
  return error()

@app.route("/addlink", methods=['POST'])
def addlink():
  errstatus = "Generic error"
  link_id = ""
  r = request.get_json()
  c = r['cve_id']
  l = r['link_url']
  d = r['link_desc']

  if not CVE.objects(id=c):
    errstatus = "CVE doesn't exist"
  elif Links.objects(cve_id=c, link=l):
    errstatus = "Link already exists!"
  else:
    Links(cve_id=c, link=l, desc=d).save()
    link_id = Links.objects.get(cve_id=c, link=l)['id']
    errstatus = "success"

  return jsonify({'error': errstatus, 'link_id': str(link_id)})

@app.route("/deletelink", methods=['POST'])
def deletelink():
  errstatus = "Generic error"
  r = request.get_json()
  l = r['link_id']

  if l and Links.objects(id=l):
    Links.objects(id=l).delete()
    errstatus = "success"
  else:
    errstatus = "Link doesn't exist"

  return jsonify({'error': errstatus})

@app.route("/editnotes", methods=['POST'])
def editnotes():
  errstatus = "Generic error"
  r = request.get_json()
  c = r['cve_id']

  if c and CVE.objects(id=c):
    CVE.objects(id=c).update(set__notes=r['cve_notes'])
    errstatus = "success"
  else:
    errstatus = "CVE doesn't exist"

  return jsonify({'error': errstatus})

@app.route("/editlink", methods=['POST'])
def editlink():
  errstatus = "Generic error"
  r = request.get_json()
  l = r['link_id']

  if l and Links.objects(id=l):
    Links.objects(id=l).update(set__link=r['link_url'], set__desc=r['link_desc'])
    errstatus = "success"
  else:
    errstatus = "Link doesn't exist"

  return jsonify({'error': errstatus})

@app.route("/getlinks", methods=['POST'])
def getlinks():
  r = request.get_json()
  c = r['cve_id'];
  return Links.objects(cve_id=c).to_json()

@app.route("/getnotes", methods=['POST'])
def getnotes():
  r = request.get_json()
  c = r['cve_id']
  return CVE.objects(id=c).to_json()
