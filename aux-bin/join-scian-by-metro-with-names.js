#!/usr/bin/env node
var dic  = require('../output/collect-cian-metro.json');
var data = require('../output/median-by-metro.2page.json');
// JSON.stringify(require('lodash')(data).map((med,i)=>({ name: dic[i-1], median: med, cianId: i })).value())//, null, 4)
console.log(_(data).map((med,i)=>({ name: dic[i-1], median: med, cianId: i })).value());
