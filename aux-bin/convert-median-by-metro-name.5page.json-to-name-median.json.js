#!/usr/bin/env node

var a = require('../output/collect-cian-metro.json')
var data = require('../output/median-by-metro-name.5page.json');
require('lodash')(a).filter(s=>s).invert().mapValues((i, metro) => data[i].median).value()
JSON.stringify(data)
