require('./setup.common');

const { routing, config, normalizeUrl, replaceUrlParams } = require('../lib/yaff.routing.esm');

global.routing = routing;
global.config = config;
global.normalizeUrl = normalizeUrl;
global.replaceUrlParams = replaceUrlParams;
