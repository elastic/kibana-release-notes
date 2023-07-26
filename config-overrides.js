module.exports = (webpackConfig, env) => {
    webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        "url": require.resolve("url/"),
        "querystring": require.resolve("querystring-es3")
    }

    return webpackConfig;
}