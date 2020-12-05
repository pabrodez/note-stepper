const path = require('path')

const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    // Where webpack looks to start building the bundle
    entry: path.resolve(__dirname, './src/index.ts'),

    // Where webpack outputs the assets and bundles
    output: {
        path:  path.resolve(__dirname, './dist'),
        filename: '[name].js',
        library: 'ToneStep'
    },

    resolve: {
        extensions: ['.ts', '.js']
      },

    mode: 'production',

    devtool: false,

    // Customize the webpack build process
    plugins: [
        // Extracts CSS into separate files
        // Note: style-loader is for development, MiniCssExtractPlugin is for production
        new MiniCssExtractPlugin({
            filename: 'styles/[name].[contenthash].css',
            chunkFilename: '[id].css',
        }),
        // Removes/cleans build folders and unused assets when rebuilding
        new CleanWebpackPlugin(),

        // Generates an HTML file from a template
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, './src/template.html'),
            filename: 'index.html', // output file
        }),

    ],

    // Determine how modules within the project are treated
    module: {
        rules: [
            // JavaScript: Use Babel to transpile JavaScript files
            { test: /\.ts$/, exclude: /node_modules/, use: ['ts-loader'] },

            
            {
                test: /\.(scss|css)$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 2,
                            sourceMap: false,
                        },
                    },
                    'postcss-loader',
                    'sass-loader',
                ],
            },
        ],
    },

    optimization: {
        minimize: true,
        minimizer: [new CssMinimizerPlugin(), "..."],
        // Once your build outputs multiple chunks, this option will ensure they share the webpack runtime
        // instead of having their own. This also helps with long-term caching, since the chunks will only
        // change when actual code changes, not the webpack runtime.
        runtimeChunk: {
          name: 'runtime',
        },
      },
      performance: {
        hints: false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000,
      },
}