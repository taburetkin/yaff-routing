require('./setup.common');
const { routing, config, normalizeUrl, replaceUrlParams } = require('../index');

global.routing = routing;
global.config = config;
global.normalizeUrl = normalizeUrl;
global.replaceUrlParams = replaceUrlParams;