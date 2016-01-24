#!/bin/sh

< ../output/collect-cian-metro.json jq .[] | tr -d '"' | nl -s " " -b a
