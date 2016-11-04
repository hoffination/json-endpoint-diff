var path = require('path')
var webpack = require('webpack')

module.exports = {
  entry: './main.js',
  output: { path: __dirname, file: 'bundle.js', filename: 'app.bundle.js' },
  module: {
    loaders: [
      {
        test: /.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015', 'es2016', 'react']
        }
      }
    ]
  }
}
