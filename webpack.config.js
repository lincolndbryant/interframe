var webpack = require('webpack');
var path = require('path');

module.exports = {
  devtool: 'inline-source-map',
  entry: {
    index: ['./src/messenger.js']
  },
  output: {
    publicPath: 'build/',
    path: path.resolve(__dirname, 'build'),
    filename: 'interframe.js',
    library: 'Interframe',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  resolve: {
    root: [
      path.resolve('./src')
    ],
    extensions: ['', '.js']
  },
  module: {
    loaders: [
      {
        test: /\.js$/, loader: 'babel', exclude: /node_modules/,
      },
      //{test: /\.css$/, loader: 'style!css'},
      //{test: /\.styl$/, loader: 'style!css!stylus'}
    ]
  },
  plugins: []
};
