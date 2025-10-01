const webpack = require('webpack');

module.exports = {
  webpack: (webpackConfig) => {
    webpackConfig.resolve.fallback = {
      ...webpackConfig.resolve.fallback,
      url: require.resolve('url/'),
      querystring: require.resolve('querystring-es3'),
      buffer: require.resolve('buffer/'),
    };

    // Add Buffer polyfill as a global
    webpackConfig.plugins.push(
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      })
    );

    const basename = process.env.BASENAME;
    if (basename) {
      webpackConfig.output.publicPath = `/${basename}/`;

      webpackConfig.plugins.push(
        new webpack.DefinePlugin({
          _BASENAME_: `'${basename}'`,
        })
      );
    }

    return webpackConfig;
  },
  devServer: (configFunction) => {
    return function (proxy, allowedHost) {
      // Create the default config
      const config = configFunction(proxy, allowedHost);

      config.client = {
        ...config.client,
        overlay: {
          ...config.client.overlay,
          runtimeErrors: (error) => {
            /**
             * This error occurs every time a version is selected in the wizard,
             * and causes the overlay to appear. It is stemming from a package.
             */
            if (
              error?.message === 'ResizeObserver loop completed with undelivered notifications.'
            ) {
              console.error(error);
              return false;
            }
            return true;
          },
        },
      };

      return config;
    };
  },
};
