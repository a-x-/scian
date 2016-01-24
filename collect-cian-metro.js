#!/usr/bin/env node
var metroUrlTpl = id => `http://www.cian.ru/cat.php?currency=2&deal_type=rent&engine_version=2&mebel=1&mebel_k=1&metro[0]=${ id }&offer_type=flat&only_foot=2&rfgr=1&room1=1&type=-2&wm=1&wp=1`;

var cl = console.log.bind(console);

var http    = require('got');
var $$      = require('cheerio'), $;
var Uri     = require('urijs');
var _       = require('lodash');

var metroCnt = 225; // С запасом, т.к. у ЦИАНа странная нумерация

var goUri = uri => new Promise((res, rej) => setTimeout(() => {
    http(uri).then(res, rej);
}, _.random(metroCnt * 10, metroCnt * 100)));

// goUri(metroUrlTpl(1))
// .then(data=>_.get(data, 'body'))
// .then(html => {return $$.load(html)})
// // .then($    => $('.objects_item_info_col_1').find('.objects_item_metro'))
// .then($    => $('meta[name="description"]'))
// .then(el   => {
//     cl(el.attr('content'))
// });
// return;

var metroNames =
Promise.all(
_(metroCnt)
.range()
.map(id => metroUrlTpl(id + 1))
.map(uri => goUri(uri))
.map(p=>p.then(data => _.get(data, 'body')))
.map(p=>p.then(html => $$.load(html)))
.map(p=>p.then($    => $('meta[name="description"]')))
.map(p=>p.then(el   => el.attr('content')))
.map(p=>p.then(title=> title.match(/метро\s+(.+?)\s*(?:[\d.,])/)))
.map(p=>p.then(match=> (match || [])[1]))
.value()
)
.then(metroList => cl(metroList))
.catch(e=>cl('err', e))
