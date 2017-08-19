var path = require('path')
var webpack = require('webpack')
const CleanWebpackPlugin = require('clean-webpack-plugin')

let pathsToClean = [
  'dist'
]

module.exports = {
  entry: './main.js',
  output: { path: path.resolve(__dirname, 'dist'), file: 'bundle.js', filename: 'app.bundle.js' },
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
    ],
    plugins: [
      new CleanWebpackPlugin(pathsToClean)
    ]
  }
}
