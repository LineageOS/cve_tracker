#!/usr/bin/python3

import json
import os
import sys

import utils

from classes import *
from flask import Flask, abort, jsonify, render_template, request

configfile = "options.json"
devicefile = "kernels.json"
forceDBUpdate = False

app = Flask(__name__)

dir = os.path.dirname(__file__)

if not os.path.isfile(os.path.join(dir, configfile)):
  print("Could not find " + configfile + " aborting!")
  sys.exit()

with open(os.path.join(dir, configfile)) as config_file:
  config = json.load(config_file)

with open(os.path.join(dir, devicefile)) as device_file:
  devices = json.load(device_file)

connect(config['dbname'], host=config['dbhost'])

@app.route("/")
def index():
    return render_template('index.html', kernels=Kernel.objects().order_by('vendor', 'device'))

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
      msg = "Added " + cve + "!"

    return render_template('addcve.html', msg=msg)
  else:
    return render_template('addcve.html')

@app.route("/getlinks", methods=['POST'])
def getlinks():
  r = request.get_json()
  c = r['cve_id'];
  return Links.objects(cve_id=c).to_json()

if __name__ == "__main__":
  if "port" in config:
    port=config['port']
  else:
    port=5000

  # TODO: add something to check github every day for new kernel repos and call getKernelTableFromGithub()
  app.run(host="0.0.0.0", debug=True, port=port)
