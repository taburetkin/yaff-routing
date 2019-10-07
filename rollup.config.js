const babel = require('rollup-plugin-babel');
//const minify = require('rollup-plugin-babel-minify');

module.exports = [
  {
    input: './index.js',
    output: {
      file: './lib/fe.routing.esm.js',
      format: 'esm'
    }
  },
  {
    input: './index.js',
    output: {
      file: './lib/fe.routing.umd.js',
      format: 'umd',
      name: 'routing'
    }
  },

  {
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
            '@babel/preset-env',
            {
              modules: false,
              targets: {
                chrome: '58',
                ie: '11'
              },
              useBuiltIns: 'usage' //enables babel and import babel into your inputFile.js
            }
          ]
        ]
      })
    ]
  }
];
