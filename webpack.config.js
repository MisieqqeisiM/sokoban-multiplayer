const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');


module.exports = {
    mode: 'development',
    entry: './client/src/index.ts',
    watch: true,
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'client/index.html',
            cache: false,
        }),
        new CleanWebpackPlugin(),
    ],
    devtool: 'inline-source-map',
    module: {
        rules: [
        {
            test: /\.tsx?$/,
            use: [
                {
                    loader: 'ts-loader',
                    options: {configFile: 'tsconfig.client.json'},
                }
            ],
            include: [
                path.resolve(__dirname, "client"),
                path.resolve(__dirname, "common"),
            ]
            
        },
        {
            test: /\.css$/,
            use: [
                "style-loader",
                'css-loader',
            ],
          },
        ],
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ],
        mainFields: ['browser', 'module', 'main'],
    },
    output: {
        filename: '[name].[contenthash].js',
        path: path.resolve(__dirname, 'dist/public'),
    },
    optimization: {
        splitChunks: {
            chunks: 'all',
        },
    },
};