const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: process.env.NODE_ENV,
  context: path.join(__dirname, './'),
  entry: './app/index.tsx',
  devtool: 'inline-source-map',
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './app/index.html',
      title: 'Your website'
    })
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    // use [name].bundle.js ?
    filename: 'bundle.js',
    publicPath: '/',

  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
};
