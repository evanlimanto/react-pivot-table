var path = require('path');
var webpack = require('webpack');

module.exports = {
    entry: './examples/app.jsx',
    output: {
        path: './examples',
        filename: 'bundle.js'
    },
    resolve: {
        extensions: ['', '.js', '.jsx', 'index.js', 'index.jsx', '.json', 'index.json'],
        root: [path.resolve('../src/components')]
    },
    module: {
        preLoaders: [
            {
                test: /\.json$/,
                loader: 'json'
            }
        ],
        loaders: [
            {
                test: /\.jsx$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                query: {
                    presets: ['es2015', 'react', 'stage-0'],
                    plugins: ['transform-runtime']
                }
            },
            {
                test: /\.js$/,
                loader: "babel-loader",
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                loader: "css-loader",
                exclude: /node_modules/
            }
        ]
    },
};

