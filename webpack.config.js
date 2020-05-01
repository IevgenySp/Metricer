const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const BrotliPlugin = require('brotli-webpack-plugin');
const JavaScriptObfuscator = require('webpack-obfuscator');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = env => {
    let isProd = env && env.NODE_ENV === 'prod';
    let entry = isProd ? {"app.min": './src/index.js'} : {app: './src/index.js'};

    let options = {
        mode: isProd ? 'production' : 'development',
        entry: entry,
        /*resolve: {
            extensions: ['.es6', '.js', '.jsx']
        },*/
        devtool: isProd ? '' : 'inline-source-map',
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
        optimization: {
            minimize: true,
            minimizer: [new UglifyJsPlugin({
                include: /\.min\.js$/
            })],
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
            new CopyPlugin([{
                from: 'favicon',
                to: 'favicon',
            }, {
                from: 'preloader',
                to: 'preloader',
            }]),
            // load `moment/locale/ja.js` and `moment/locale/it.js`
            new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /ja|it/),
        ],
        output: {
            filename: '[name].bundle.js',
            path: path.resolve(__dirname, 'dist'),
            publicPath: '/',
        },
    };

    if (isProd) {
        options.optimization = {
            minimize: true,
            minimizer: [new UglifyJsPlugin({
                include: /*/\.min\.js$/*/ ['app.min.bundle.js', 'vendors.bundle.js']
            })],
            splitChunks: {
                cacheGroups: {
                    commons: {
                        test: /[\\/]node_modules[\\/]/,
                            name: 'vendors',
                            chunks: 'all'
                    }
                }
            }
        };

        // TODO: Investigate Brotli optimization
        /*options.plugins.push(new BrotliPlugin({
            asset: '[path].br[query]',
            test: /\.(js|css|html|svg)$/,
            threshold: 10240,
            minRatio: 0.8
        }));*/

        /*options.plugins.push(new JavaScriptObfuscator ({
            rotateUnicodeArray: true
        }, ['app.bundle.js']));*/
    }

    return options;
};
