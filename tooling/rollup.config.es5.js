const babel = require('rollup-plugin-babel');

module.exports = {
  input: './index.js',
  output: {
    file: './lib/fe.routing.es5.umd.js',
    format: 'umd',
    name: 'routing'
  },
  plugins: [
    babel({
      babelrc: false,
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
