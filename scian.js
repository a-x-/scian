#!/usr/bin/env node
//
// init

var cl = console.log.bind(console);
var deb = console.error.bind(console, 'info: ');
var err = console.error.bind(console);

var isInBro = () => typeof window !== 'undefined';

var loadJs = isInBro()
    ? src => {
        var script = document.createElement('script');
        script.src = src;
        script.onload=()=>deb('loaded', src);
        document.head.appendChild(script);
    }
    : src => require(src.match(/([^\/]+).min.js$/)[1]);

//
// load libs
// https://github.com/search?l=JavaScript&q=statistic&type=Repositories&utf8=✓
var jStat   = loadJs('https://cdnjs.cloudflare.com/ajax/libs/jstat/1.5.2/jstat.min.js').jStat;
var d3      = loadJs('https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.13/d3.min.js');
var _       = loadJs('https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.0.0/lodash.min.js');

var getopt  = require('./magicli'); // under meow (under minimist (under optimist))
var http    = require('got');
var $$      = require('cheerio'), $;
var Uri     = require('urijs');

//
// set parameters
const cli = getopt(`
    Usage
      $ scian [url]

    Options
      -p, --price-min       [30k] Min cian search price (for uri query)
      -f, --foot-time       [15]  Metro foot time
      -n, --pages-num       [10]  Number of pages to scan
      -m, --median                Output only median number

    Examples
      $ ./scian
      $ ./scian -n10 -p10 -f5
      $ scian -f0 'http://www.cian.ru/cat.php?deal_type=sale&district[0]=121&offer_type=flat&only_foot=2&room1=1'
`);

cli.flags.uri = cli.input[0];

if(cli.flags.footTime === 0) {
    cli.flags.footTime = 100500; // metro foot time not sense
}

var pagesNum = cli.flags.pagesNum || 10;

// deb('cli', cli.flags);

//
// buisness logic

var goUri = isInBro()
    ? uri => {location.href = uri}
    : uri => new Promise((res, rej) => setTimeout(() => {

        http(uri, { headers: { Cookie: 'serp_view_mode=table' } }).then(data => {
            var html = data.body;
            deb('html loaded', html.length)//, html.match(/objects_item_price/g))
            // deb('html', html)
            $ = $$.load(html, { normalizeWhitespace: true });
            deb('parser inited: ', typeof $);
            res($);
        });

    }, _.random(pagesNum, pagesNum * 100)));

var grabPrices = $ => {

        var collection = _($('body').find('.objects_item_price'))
        .toArray()
        .map(el=>{
            var price = _.get(el, 'children.0.data');
            return _.isString(price) && price.trim() ? price : _.get(el, 'children.1.children.0.data')
        });

        // deb('collection', collection.value());

        // grab prices
        var prices = collection
        .map(txt => txt.trim().replace(/\s/,''))
        .map(txt => parseInt(txt, 10) / 1000)
        .value();

        return prices;

};

var calcStats = prices => {

    deb('prices', prices.join(','))

    // цены аренды в мес в тысячах руб.
    // [35, 40, 40, ..., 38, 38, 38, 38, 38, 38, 39]

    if(!cli.flags.median) {
        // 90th percentile — максимум без выбросов
        cl('true max', jStat.percentile(prices, .9).toFixed(2)) // 81

        // 10th percentile — минимум без выбросов
        cl('true min', jStat.percentile(prices, .1).toFixed(2)) // 35

        // Среднее (тупое среднее)
        cl('mean', jStat.mean(prices).toFixed(2)) // 49
    }

    // median — медиана (правильное среднее)
    var median = jStat.median(prices).toFixed(2);
    cli.flags.median ? cl(median) : cl('**median**', median) // 38

};

var getUri = pageNum_ => {

    var priceMin        = cli.flags.priceMin || 30000;
    var metroFootTime   = cli.flags.footTime || 15;
    var pageNum         = pageNum_ || 1;
    var baseUri         = cli.flags.uri || require('./package.json').appConfig.baseUri;
    var uri             = Uri(baseUri).setQuery({
                            p: pageNum,
                            foot_min: metroFootTime,
                            minprice: priceMin
                        }).toString();

    return uri;

};

//
// run!

deb('go URIs');

// go to cian search result
// Снять на длительный срок однокомнатную квартиру с фото
// в центре с мебелью, холодильником и стиралкой

Promise.all(
    _(pagesNum).range()
    .map(
        i => goUri(getUri(i + 1)).then(
        $ => grabPrices($), e=>err('err', e)))
    .value()
)
.then(pricesGroups => _.flatten(pricesGroups)) // groups of results by pages
.then(prices => calcStats(prices))
.catch(e=>err('groups err', e))
