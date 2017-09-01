#!/usr/bin/python3

import sys

try:
    # For python3
    from urllib.request import Request, urlopen
    from html.parser import HTMLParser
except ImportError:
    # For python2
    from urllib2 import Request, urlopen
    from HTMLParser import HTMLParser


class LinksParser(HTMLParser):
    def __init__(self):
        HTMLParser.__init__(self)
        self.recording = 0
        self.data = 0

    def handle_starttag(self, tag, attributes):
        if tag != 'div':
            return
        if self.recording:
            self.recording += 1
            return
        for name, value in attributes:
            if name == 'class' and value == 'cvssbox':
                break
        else:
            return
        self.recording = 1

    def handle_endtag(self, tag):
        if tag == 'div' and self.recording:
            self.recording -= 1

    def handle_data(self, data):
        if self.recording:
            self.data = data

def get_score(cve):
    if cve[:3] == 'LVT':
        return 10.0
    score = -1
    try:
        p = LinksParser()
        url = "https://www.cvedetails.com/cve/" + cve
        hdr = {'User-Agent': 'Mozilla/5.0'} # required to not get a http error 403
        req = Request(url, headers=hdr)
        html = urlopen(req).read().decode('utf-8')
        p.feed(html)
        score = p.data
        p.close()
    except:
        print("Unexpected error:", sys.exc_info()[0])

    return score
