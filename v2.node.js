//
// init

var cl = console.log.bind(console);
var isInBro = () => typeof window !== 'undefined';

var loadJs = isInBro()
    ? src => {
        var script = document.createElement('script');
        script.src = src;
        script.onload=()=>cl('loaded', src);
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

    Examples
      $ scian
`);

cli.flags.uri = cli.input[0];
// cl('uri', cli.flags.uri);

//
// buisness logic

var goUri = isInBro()
    ? uri => {location.href = uri}
    : uri => http(uri, { headers: { Cookie: 'serp_view_mode=table' } }).then(data => {
        var html = data.body;
        cl('html loaded', html.length)//, html.match(/objects_item_price/g))
        $ = $$.load(html);
        cl('parser inited: ', typeof $);
        return $;
    });

var grabPrices = $ => {

    var collection = _($('body').find('.objects_item_price'))
    .toArray()
    .map(el=>el.children[0].data);

    // cl('collection', collection.value());

    // grab prices
    var prices = collection
    .map(txt => txt.trim().replace(/\s/,''))
    .map(txt => parseInt(txt, 10) / 1000)
    .value();

    return prices;

};

var calcStats = prices => {

    cl('prices', prices.join(','))

    // цены аренды в мес в тысячах руб.
    // [35, 40, 40, ..., 38, 38, 38, 38, 38, 38, 39]

    // 90th percentile — максимум без выбросов
    cl('true max', jStat.percentile(prices, .9).toFixed(2)) // 81

    // 30th percentile — минимум без выбросов
    cl('true min', jStat.percentile(prices, .3).toFixed(2)) // 35

    // Среднее (тупое среднее)
    cl('mean', jStat.mean(prices).toFixed(2)) // 49

    // mediane — медиана (правильное среднее)
    cl('**median**', jStat.median(prices).toFixed(2)) // 38

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

cl('go URIs');

// go to cian search result
// Снять на длительный срок однокомнатную квартиру с фото
// в центре с мебелью, холодильником и стиралкой
var pagesNum = cli.flags.pagesNum || 10;

Promise.all(
    _(pagesNum).range()
    .map(
        i => goUri(getUri(i + 1)).then(
        $ => grabPrices($), e=>cl('err', e)))
    .value()
)
.then(pricesGroups => _.flatten(pricesGroups)) // groups of results by pages
.then(prices => calcStats(prices))
.catch(e=>cl('groups err', e))
