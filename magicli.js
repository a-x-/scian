var getopt  = require('meow');
var _       = require('lodash');

module.exports = magic => {

    var help    = magic;
    var config  = _(magic.match(/^\s*-\w,\s*--[\w-]+/gm))
    .map(s=>s.match(/-(\w),\s*--(.+)\s*/).slice(1))
    .fromPairs()
    .assign({ h: 'help' })
    .value();

    return getopt(help, { alias: config });

};
