#!/bin/sh

< ./output/collect-cian-metro.json tr "'" '"' | sed 's/undefined/""/' > ./output/collect-cian-metro2.json
mv ./output/collect-cian-metro2.json ./output/collect-cian-metro.json
