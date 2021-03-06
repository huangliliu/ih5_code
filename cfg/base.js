'use strict';
let path = require('path');
let defaultSettings = require('./defaults');

// Additional npm or bower modules to include in builds
// Add all foreign plugins you may need into this array
// @example:
// let npmBase = path.join(__dirname, '../node_modules');
// let additionalPaths = [ path.join(npmBase, 'react-bootstrap') ];
let additionalPaths = [];

module.exports = {
    additionalPaths: additionalPaths,
    port: defaultSettings.port,
    debug: true,
    devtool: 'eval',
    output: {
        path: path.join(__dirname, '/../dist'),
        filename: 'app.js',
        publicPath: `.${defaultSettings.publicPath}`
    },
    devServer: {
        contentBase: './src/',
        historyApiFallback: true,
        hot: true,
        port: defaultSettings.port,
        publicPath: defaultSettings.publicPath,
        noInfo: false
    },
    resolve: {
        extensions: ['', '.js', '.jsx'],
        alias: {
            actions: `${defaultSettings.srcPath}/actions/`,
            components: `${defaultSettings.srcPath}/components/`,
            sources: `${defaultSettings.srcPath}/sources/`,
            stores: `${defaultSettings.srcPath}/stores/`,
            styles: `${defaultSettings.srcPath}/styles/`,
            config: `${defaultSettings.srcPath}/config/` + process.env.REACT_WEBPACK_ENV,
            'rc-slider/src/Track': `${defaultSettings.srcPath}/../node_modules/rc-slider/lib/Track`,
            'rc-slider/src/Steps': `${defaultSettings.srcPath}/../node_modules/rc-slider/lib/Steps`,
            'rc-slider/src/Marks': `${defaultSettings.srcPath}/../node_modules/rc-slider/lib/Marks`,
            'bridge': `${defaultSettings.srcPath}/bridge`,
            'jscolor/jscolor': `${defaultSettings.srcPath}/../lib/jscolor`,
            'macKeys': `${defaultSettings.srcPath}/../lib/macKeys`,
            'codemirror/CodeMirror': `${defaultSettings.srcPath}/Codemirror`
        }
    },
    module: {}
};
