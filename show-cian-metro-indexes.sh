#!/bin/sh

< collect-cian-metro.json jq .[] | tr -d '"' | nl -s " " -b a
