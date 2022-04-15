console.log('NYC CONFIG');
module.exports = {
  extends: '@istanbuljs/nyc-config-babel',
  //all: true,
  include: [
    'index.js',
    'config.js',
    'Routing.js',
    'RouteHandler.js',
    'RoutesManager.js',
    'ResponseContext.js',
    'RequestContext.js',
    'utils.js'
  ],
  // exclude: [
  //   'jsdocs.js',
  //   'nyc.config.js',
  //   'rollup.config.js',
  //   'jsdoc.config.js'
  // ],
  reporter: ['text', 'html'],
  'report-dir': './.coverage'
};
