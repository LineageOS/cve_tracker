cve_tracker
============

1. Use Python 3.2 or higher
2. Run `pip3 install -r requirements.txt`
3. Generate a GitHub personal access token [here](https://github.com/settings/tokens). You don't need to select any scopes, just give it a name.
4. Have access to a MongoDB instance and the IP address of the box ([Install guide](https://docs.mongodb.com/manual/administration/install-on-linux/))
5. Start the MongoDB instance with `sudo service mongod start`
6. Copy app.cfg.example to app.cfg and provide the token you added above along with the IP of the MongoDB server.
7. Seed your database initially by running `python3 seed.py`.
8. Once you're set up, run: `./run` to start the service.

This is a WIP, cats will be eaten.


# v1 API


## `GET` __/api/v1/kernels__

__Query parameters__

* `deprecated` (int) (optional)
  * `0` will return all kernels that are not deprecated
  * `1` will return all deprecated kernels
  * any other value will return all kernels


__Response__


```
{
  "android_kernel_acer_t20-common": {
    "deprecated": true,
    "device": "t20-common",
    "last_github_update": {
      "$date": 1480952365000
    },
    "progress": 0,
    "repo_name": "android_kernel_acer_t20-common",
    "vendor": "acer"
  },
  ...
}
```

## `GET` __/api/v1/kernels/<kernel_name>__

__Response__


```
{
  "deprecated": false,
  "device": "t20-common",
  "last_github_update": {
    "$date": 1480952365000
  },
  "progress": 0,
  "repo_name": "android_kernel_acer_t20-common",
  "statuses": {
    "CVE-2012-6657": 1,
    "CVE-2012-6689": 1,
    "CVE-2014-0196": 1,
    "CVE-2014-2523": 1,
    "CVE-2014-2851": 1,
    "CVE-2014-4014": 1,
    .
    .
    .
    "CVE-2016-9806": 1
  },
  "vendor": "acer"
}
```

## `GET` __/api/v1/kernels/<kernel_name>/<cve_name>__

__Response__


```
{
  "description": "unpatched",
  "status": 1
}
```

## `GET` __/api/v1/cves__

__Response__


```
{
  "CVE-2012-6657": {
    "cve_name": "CVE-2012-6657",
    "cvss_score": 2.0,
    "links": [
      {
        "cve_id": {
          "$oid": "5990886c092e37063df5d10e"
        },
        "link": "https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2012-6657"
      },
      {
        "cve_id": {
          "$oid": "5990886c092e37063df5d10e"
        },
        "desc": "d",
        "link": "https://www.google.ro/"
      }
    ],
    "notes": "adsadadasdasdasdasdasd"
  },
  ...
```

## `GET` __/api/v1/cves/<cve_name>__

__Response__


```
{
  "cve_name": "CVE-2012-6657",
  "cvss_score": 2.0,
  "links": [
    {
      "cve_id": {
        "$oid": "5990886c092e37063df5d10e"
      },
      "link": "https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2012-6657"
    },
    {
      "cve_id": {
        "$oid": "5990886c092e37063df5d10e"
      },
      "desc": "d",
      "link": "https://www.google.ro/"
    }
  ],
  "notes": "adsadadasdasdasdasdasd",
  "statuses": {
    "android_kernel_acer_t20-common": 1,
    "android_kernel_acer_t30": 2,
    "android_kernel_alcatel_msm8916": 1,
    "android_kernel_amazon_bowser-common": 1,
    .
    .
    .
    "sony-kernel-u8500": 1,
    "zte-kernel-msm7x27":
  },
  "tags": [
    "some_tag"
  ]
}
```
