const path = require('path')

const { CleanWebpackPlugin } = require('clean-webpack-plugin')
// const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  // Where webpack looks to start building the bundle
  entry: path.resolve(__dirname, './src/index.ts'),

  // Where webpack outputs the assets and bundles
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].bundle.js',
    publicPath: '/',
  },

  resolve: {
    extensions: ['.ts', '.js'],
    // alias here
  },

  mode: 'development',

  devtool: 'inline-source-map',

  devServer: {
    historyApiFallback: true,
    contentBase: path.resolve(__dirname, './dist'),
    open: true,
    compress: true,
    hot: true,
    port: 8080,
  },

  // Customize the webpack build process
  plugins: [
    // Removes/cleans build folders and unused assets when rebuilding
    new CleanWebpackPlugin(),

    // Generates an HTML file from a template
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './src/template.html'),
      filename: 'index.html', // output file
    }),
    // Only update what has changed on hot reload
    // new webpack.HotModuleReplacementPlugin(),
    
  ],

  // Determine how modules within the project are treated
  module: {
    rules: [
      
      {test: /\.ts$/, exclude: /node_modules/, use: ['ts-loader']},

      // Styles: Inject CSS into the head with source maps
      {
        test: /\.(scss|css)$/,
        use: [
          'style-loader',
          {loader: 'css-loader', options: {sourceMap: true, importLoaders: 1}},
          // {loader: 'postcss-loader', options: {sourceMap: true}},
          {loader: 'sass-loader', options: {sourceMap: true}},
        ],
      },
    ],
  },
}