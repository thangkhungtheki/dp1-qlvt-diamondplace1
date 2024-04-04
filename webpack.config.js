// webpack.config.js

const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: './index.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js'
  },
  target: 'node',
  externals: [nodeExternals()] ,
  mode: 'production'
};