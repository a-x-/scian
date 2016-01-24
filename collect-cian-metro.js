#!/usr/bin/env node
var metroUrlTpl = id => `http://www.cian.ru/cat.php?deal_type=sale&metro[0]=${id}`;

var cl = console.log.bind(console);

var http    = require('got');
var $$      = require('cheerio'), $;
var Uri     = require('urijs');
var _       = require('lodash');

var metroCnt = 226; // С запасом, т.к. у ЦИАНа странная нумерация

var goUri = uri => new Promise((res, rej) => setTimeout(() => {
    http(uri).then(res, rej);
}, _.random(metroCnt, metroCnt * 100)));

var metroNames =
Promise.all(
_(metroCnt)
.range()
.map(id => metroUrlTpl(id + 1))
.map(uri => goUri(uri))
.map(p=>p.then(data => _.get(data, 'body')))
.map(p=>p.then(html => $$.load(html)))
.map(p=>p.then($    => $('.objects_title.serps-header__title')))
.map(p=>p.then(el   => el.text()))
.map(p=>p.then(title=> title.match(/Купить квартиру рядом с метро\s+(.+)\s*/)))
.map(p=>p.then(match=> (match || [])[1]))
.value()
)
.then(metroList => cl(metroList))
.catch(e=>cl('err', e))
