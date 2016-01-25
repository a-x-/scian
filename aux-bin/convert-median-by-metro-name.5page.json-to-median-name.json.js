#!/usr/bin/env node
var a = require('../output/collect-cian-metro.json')
var data = require('../output/median-by-metro-name.5page.json');
var medianName = require('lodash')(a)
.filter(s=>s)
.invert()
.mapValues((i, metro) => data[i].median)
.invert()
.sort()
.value()

JSON.stringify(medianName)
console.log(medianName);
