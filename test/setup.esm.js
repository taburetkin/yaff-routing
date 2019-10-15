require('./setup.common');
const { routing } = require('../lib/yaff.routing.esm');
global.routing = routing;

const config = require('../config');
Object.assign(config, routing.config);
