from mongoengine import *

class Config(Document):
    last_update = DateTimeField(required=True)

class CVE(Document):
    cve_name = StringField(required=True)
    notes = StringField(required=False)
    tags = ListField(StringField(), required=False, default=None)
    cvss_score = FloatField(required=True, default=-1)
    affected_versions = ListField(StringField(), required=False, default=None)
    fixed_versions = ListField(StringField(), required=False, default=None)

class Kernel(Document):
    repo_name = StringField(required=True)
    last_github_update = DateTimeField(required=True)
    vendor = StringField(required=True)
    device = StringField(required=True)
    progress = IntField(required=True, default=0)
    deprecated = BooleanField(required=True, default=False)
    tags = ListField(StringField(), required=False, default=None)
    version = StringField(required=False, default=None)

class Status(Document):
    short_id = IntField(required=True)
    text = StringField(required=True)

class Patches(Document):
    kernel = ObjectIdField()
    cve = ObjectIdField()
    status = ObjectIdField()

class Links(Document):
    cve_id = ObjectIdField()
    link = StringField(required=True)
    desc = StringField(required=False)

class Log(Document):
    user = StringField(required=True)
    action = StringField(required=True)
    dateAndTime = DateTimeField(required=True)
    affectedId = ObjectIdField(required=False)
    result = StringField(required=False)
