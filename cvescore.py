#!/usr/bin/python3

import urllib.request

from html.parser import HTMLParser

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
    p = LinksParser()
    f = urllib.request.urlopen("https://www.cvedetails.com/cve/" + cve)
    html = f.read().decode('utf-8')
    p.feed(html)
    score = p.data
    p.close()
    return score
