const babel = require('rollup-plugin-babel');
const resolve = require('rollup-plugin-node-resolve');

module.exports = {
  input: './index.js',
  output: {
    file: './lib/fe.routing.es5.umd.js',
    format: 'umd',
    name: 'routing'
  },
  plugins: [
    //resolve(),
    babel({
      babelrc: false,
      exclude: [/\/core-js\//],
      presets: [
        [
          '@babel/env',
          {
            modules: 'false',
            targets: {
              chrome: '58',
              ie: '11'
            },
            useBuiltIns: 'usage',
            corejs: 3
          }
        ]
      ]
    })
  ]
};
