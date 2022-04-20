require('./setup.common');

const routing = require('../lib/yaff.routing.es5.umd');

global.routing = routing;
global.config = routing.config;
global.normalizeUrl = routing.normalizeUrl;
global.replaceUrlParams = routing.replaceUrlParams;

// const config = require('../config');
// Object.assign(config, routing.config);
