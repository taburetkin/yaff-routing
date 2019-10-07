const babel = require('rollup-plugin-babel');
const minify = require('rollup-plugin-babel-minify');

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
      file: './lib/fe.routing.es5.umd.js',
      format: 'umd',
      name: 'routing'
    },
    plugins: [
      babel({
        exclude: 'node_modules/**', // only transpile our source code,
        runtimeHelpers: true
      }),
      minify()
    ]
  }
];
