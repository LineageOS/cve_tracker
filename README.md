cve_tracker
============

1. Use Python 3.2 or higher
2. Run `pip install -r requirements.txt` (use pip3 if python2 is the default on your system)
3. Generate a GitHub personal access token [here](https://github.com/settings/tokens). You don't need to select any scopes, just give it a name.
4. Have access to a MongoDB instance and the IP address of the box ([Install guide](https://docs.mongodb.com/manual/administration/install-on-linux/))
5. Start the MongoDB instance with `sudo service mongod start`
6. Copy app.cfg.example to app.cfg and provide the token you added above along with the IP of the MongoDB server.
7. Seed your database initially by running `python seed.py`.
8. Once you're set up, run: `./run` to start the service.

This is a WIP, cats will be eaten.
