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
