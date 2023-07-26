const webpack = require('webpack');

module.exports = (webpackConfig) => {
    webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        "url": require.resolve("url/"),
        "querystring": require.resolve("querystring-es3")
    };

    const basename = process.env.BASENAME;
    if (basename) {
        webpackConfig.output.publicPath = `/${basename}/`;

        webpackConfig.plugins.push(new webpack.DefinePlugin({
            _BASENAME_: `'${basename}'`
        }));
    }

    return webpackConfig;
}