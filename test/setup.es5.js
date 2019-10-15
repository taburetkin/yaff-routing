require('./setup.common');
const routing = require('../lib/yaff.routing.es5.umd');
global.routing = routing;

const config = require('../config');
Object.assign(config, routing.config);
