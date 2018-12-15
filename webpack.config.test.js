const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin');
const path = require('path');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const webpack = require('webpack');

module.exports = () => {

    const project_root = __dirname;

    const configFile = path.resolve(project_root, 'tsconfig.json');
    return {
        mode: 'production',
        devtool: 'source-map',
        entry: ['reflect-metadata', './test.ts'],
        bail: true,
        output: {
            filename: 'test.js',
            path: __dirname + '/dist'
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js'],
            // plugins: [new TsconfigPathsPlugin({ configFile })],
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    enforce: 'pre',
                    loader: 'tslint-loader',
                    options: {
                        emitErrors: true,
                    },
                },
                {
                    test: /\.tsx?$/,
                    use: [{ loader: 'cache-loader' }, { loader: 'ts-loader' }],
                },
            ],
        },
        plugins: [
            new DuplicatePackageCheckerPlugin(),
            new ProgressBarPlugin(),
            new webpack.NoEmitOnErrorsPlugin(),
            new webpack.DefinePlugin({
                'global.GENTLY': false,
            }),
        ],
        externals: [
            nodeExternals(),

            function (context, request, callback) {
                if (/^[a-z\-0-9]+$/.test(request)) {
                    return callback(null, 'commonjs ' + request);
                }
                callback();
            }

        ],
        target: 'node',
        node: {
            __dirname: false,
            __filename: false,
        },
    };
};
