const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const BrotliPlugin = require('brotli-webpack-plugin');
const JavaScriptObfuscator = require('webpack-obfuscator');

module.exports = env => {
    let isProd = env && env.NODE_ENV === 'prod';
    let entry = isProd ? {"app.min": './src/index.js'} : {app: './src/index.js'};

    let options = {
        mode: isProd ? 'production' : 'development',
        entry: entry,
        /*resolve: {
            extensions: ['.es6', '.js', '.jsx']
        },*/
        devtool: 'inline-source-map',
        devServer: {
            contentBase: './dist',
        },
        module: {
            rules: [
                {
                    test: /\.jsx?$/,
                    exclude: /node_modules/,
                    loader: 'babel-loader',
                    query: {
                        presets: ['@babel/preset-env', '@babel/preset-react']
                    }
                },
                {
                    test: /\.css$/,
                    loader: "style-loader!css-loader"
                },
                {
                    test: /\.svg/,
                    use: {
                        loader: 'svg-url-loader',
                        options: {}
                    }
                },
                {
                    test: /\.(png|jpe?g|gif)$/i,
                    use: [
                        {
                            loader: 'file-loader',
                        },
                    ],
                }]
        },
        plugins: [
            // new CleanWebpackPlugin(['dist/*']) for < v2 versions of CleanWebpackPlugin
            new CleanWebpackPlugin(),
            new HtmlWebpackPlugin({
                title: 'Metricer',
                template: './index.html'
            }),
            new webpack.DefinePlugin({
                //'process.env': {
                //    NODE_ENV: '"dev"'
                //}
            }),
            // TODO: Investigate Brotli optimization
            /*new BrotliPlugin({
                asset: '[path].br[query]',
                test: /\.(js|css|html|svg)$/,
                threshold: 10240,
                minRatio: 0.8
            })*/
        ],
        optimization: {
            minimize: true,
            minimizer: [new UglifyJsPlugin({
                include: /\.min\.js$/
            })],
        },
        output: {
            filename: '[name].bundle.js',
            path: path.resolve(__dirname, 'dist'),
            publicPath: '/',
        },
    };

    if (isProd) {
        options.optimization.splitChunks = {
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all'
                }
            }
        };

        options.plugins.push(new JavaScriptObfuscator ({
            rotateUnicodeArray: true
        }, ['app.bundle.js']));
    }

    return options;
};
