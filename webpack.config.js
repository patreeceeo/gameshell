const path = require('path');

module.exports = {
  mode: process.env.NODE_ENV,
  context: path.join(__dirname, './'),
  entry: './app/index.tsx',
  devtool: 'inline-source-map',
  output: {
    path: path.join(__dirname, 'public'),
    filename: 'bundle.js',
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
