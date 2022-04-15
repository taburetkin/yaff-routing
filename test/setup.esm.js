require('./setup.common');

const { routing, config } = require('../lib/yaff.routing.esm');

global.routing = routing;
global.config = config;

// const config = require('../config');
// Object.assign(config, routing.config);
