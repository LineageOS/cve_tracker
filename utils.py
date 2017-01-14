#!/usr/bin/python3

import app
import datetime

from classes import *
from github import Github
from mongoengine import *

connect(app.config['dbname'], host=app.config['dbhost'])

def getVendorNameFromRepo(repo):
  v = "error"
  n = "error"
  if len(repo.split('_')) < 2:
    # lge-kernel-mako
    v = repo.split('-')[0]
    n = repo.split('-')[2]
  elif len(repo.split('_')) == 4:
    # android_kernel_samsung_manta
    v = repo.split('_')[2]
    n = repo.split('_')[3]
  print(v,n)
  return v, n

def getKernelTableFromGithub():
  print("Updating kernel list from github...this may take a long time...")

  u = app.config['githubusername']
  p = app.config['githubtoken']
  g = Github(u, p)
  orgs = ["LegacyXperia", "LineageOS"]
  for name in orgs:
    org = g.get_organization(name)

    for repo in org.get_repos():
      if "android_kernel_" in repo.name or "-kernel-" in repo.name:
        repo_name = repo.name
        if name != "LineageOS":
          # avoid naming conflicts
          repo_name = repo_name.replace("kernel", name + "-kernel")
        if repo_name not in Kernel.objects().order_by('repo_name'):
          v, n = getVendorNameFromRepo(repo.name)
          if v is not "error" and n is not "error":
            Kernel(repo_name=repo_name, last_github_update=repo.updated_at, vendor=v, device=n).save()
            for c in CVE.objects():
              Patches(cve=c.id, kernel=Kernel.objects.get(repo_name=repo_name).id, status=Status.objects.get(text='unpatched').id).save()

  print("Done!")
  return

def nukeCVE(cve):
  if CVE.objects(cve_name=cve):
    cve_id = CVE.objects(cve_name=cve).first()['id']
    Patches.objects(cve=cve_id).delete()
    Links.objects(cve_id=cve_id).delete()
    CVE.objects(id=cve_id).delete()
