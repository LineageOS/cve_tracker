#!/usr/bin/python3

import sys
import requests


def get_score(cve):
    if cve[:3] == 'LVT':
        return 10.0
    score = -1
    try:
        response = requests.get("https://cve.circl.lu/api/cve/{}".format(cve))
        response.raise_for_status()
        score = response.json()['cvss']
        if not score:
            score = -1
    except Exception as e:
        print(e)

    return score
