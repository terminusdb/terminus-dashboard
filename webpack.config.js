const path = require('path');
const HtmlWebPackPlugin = require("html-webpack-plugin");
const CopyWebPackPlugin = require("copy-webpack-plugin");
require("@babel/register");
// Webpack Configuration
const config = {

  // Entry
  entry: path.resolve(__dirname, 'src/index.js'),
  // Output
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'terminus-dashboard.min.js',
    sourceMapFilename: 'terminus-dashboard.min.js.map',
    libraryTarget: 'var',
    library: 'TerminusDashboard',
  },
  node: {
    process: false
  },
  // Loaders
  module: {
    rules : [
      // JavaScript/JSX Files
      {
         test: /\.js$/,
         exclude: /node_modules/,
         loader: 'babel-loader'
      }
    ]
  },
  devtool :'source-map',
  // Plugins
};

module.exports = function(env, argv){


  if (argv.mode === 'development') {
       // webpack-dev-server configuration
     config.devServer={
        // Can be omitted unless you are using 'docker'
        contentBase: path.resolve(__dirname,'dist'),
        // 'Live-reloading' happens when you make changes to code
        // dependency pointed to by 'entry' parameter explained earlier.
        // To make live-reloading happen even when changes are made
        // to the static html pages in 'contentBase', add
        // 'watchContentBase'
        watchContentBase: true,
        compress: true
    }
  }

  config.plugins= [
      new HtmlWebPackPlugin({
        inject: false,
        template: path.resolve(__dirname, 'src/index.html'),
        bundleFileName:"terminus-dashboard.min.js"
      }),
      new CopyWebPackPlugin([
        { from: path.resolve(__dirname, 'src/css'), to: 'css' },
        { from: path.resolve(__dirname, 'src/UIconfig.json'), to:'./' }
      ])
    ]

  return config;
};

// Exports
//module.exports = config;
