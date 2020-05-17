const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  mode: process.env.NODE_ENV,
  context: path.join(__dirname, './'),
  entry: [
    ...(process.env.NODE_ENV === "development" ? [
      'webpack-hot-middleware/client',
      'react-hot-loader/patch'
    ] : []),
    './client/index.tsx'
  ],
  devtool: 'inline-source-map',
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './client/index.html',
      title: 'Your website'
    })
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].[hash].js',
    publicPath: '/',
  },
  optimization: {
    // webpack emits boilderplate code for each module that allows `require` calls to work correctly.
    // This tells webpack to put all of that in one file.
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    alias: process.env.NODE_ENV === "development" ? {
      'react-dom': '@hot-loader/react-dom',
    } : {},
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
