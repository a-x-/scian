var getopt  = require('meow');
module.exports = magic => {

    var help    = magic;
    var config  = _(magic.match(/^\s*-\w,\s*--[\w-]+/gm))
    .map(s=>s.match(/-(\w),\s*--(.+)\s*/).slice(1))
    .fromPairs()
    .value();

    return getopt(help, config);

};
