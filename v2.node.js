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

// load libs
// https://github.com/search?l=JavaScript&q=statistic&type=Repositories&utf8=✓
var jStat   = loadJs('https://cdnjs.cloudflare.com/ajax/libs/jstat/1.5.2/jstat.min.js').jStat;
var d3      = loadJs('https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.13/d3.min.js');
var _       = loadJs('https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.0.0/lodash.min.js');
var http    = require('got');

var $$ = require('cheerio'),
    $;

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

    var collection = _( $('body').find('.objects_item_price'))
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

    // cl('prices', prices)

    // цены аренды в мес в тысячах руб.
    // [35, 40, 40, 44, 45, 47, 50, 50, 50, 55, 60, 65, 65, 70, 70, 75, 80, 90, 95, 95, 100, 120, 30, 32, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 36, 36, 37, 37, 37, 37, 38, 38, 38, 38, 38, 38, 38, 39]

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

    var priceMin = 30000;
    var metroFootTimeMin = 15;
    var pageNum = pageNum_ || 1;
    var uri = `http://www.cian.ru/cat.php?currency=2&deal_type=rent&engine_version=2&foot_min=${ metroFootTimeMin }&mebel=1&mebel_k=1&metro%5B0%5D=4&metro%5B10%5D=50&metro%5B11%5D=54&metro%5B12%5D=56&metro%5B13%5D=58&metro%5B14%5D=61&metro%5B15%5D=64&metro%5B16%5D=66&metro%5B17%5D=68&metro%5B18%5D=71&metro%5B19%5D=77&metro%5B1%5D=8&metro%5B20%5D=78&metro%5B21%5D=80&metro%5B22%5D=84&metro%5B23%5D=85&metro%5B24%5D=86&metro%5B25%5D=96&metro%5B26%5D=98&metro%5B27%5D=103&metro%5B28%5D=105&metro%5B29%5D=114&metro%5B2%5D=8&metro%5B30%5D=115&metro%5B31%5D=115&metro%5B32%5D=119&metro%5B33%5D=121&metro%5B34%5D=123&metro%5B35%5D=124&metro%5B36%5D=125&metro%5B37%5D=129&metro%5B38%5D=130&metro%5B39%5D=132&metro%5B3%5D=12&metro%5B40%5D=145&metro%5B41%5D=148&metro%5B42%5D=149&metro%5B43%5D=150&metro%5B44%5D=159&metro%5B4%5D=15&metro%5B5%5D=18&metro%5B6%5D=20&metro%5B7%5D=38&metro%5B8%5D=46&metro%5B9%5D=47&minprice=${ priceMin }&offer_type=flat&only_foot=2&rfgr=1&room1=1&type=-2&wm=1&wp=1&p=${ pageNum }`;

    return uri;

};
var uri = getUri();

cl('go uri');
// http(uri, { headers: { Cookie: 'serp_view_mode=table' } }).then(html => cl(html));
// return;
// go to cian search result
// Снять на длительный срок однокомнатную квартиру с фото
// в центре с мебелью, холодильником и стиралкой
Promise.all(
    _(11).range()
    .map(i => goUri(getUri(i + 1)).then($ => grabPrices($), e=>cl('err', e)))
    .value()
)
.then(pricesGroups => _.flatten(pricesGroups))
.then(prices => calcStats(prices))
.catch(e=>cl('groups err', e))
