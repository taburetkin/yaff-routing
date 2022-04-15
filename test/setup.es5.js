require('./setup.common');

const routing = require('../lib/yaff.routing.es5.umd');

global.routing = routing;
global.config = routing.config;

// const config = require('../config');
// Object.assign(config, routing.config);
