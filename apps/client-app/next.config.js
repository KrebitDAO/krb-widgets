const withTM = require('next-transpile-modules')(['@krebitdao/review-widget']);

module.exports = withTM({
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // don't resolve 'fs' module on the client to prevent this error on build --> Error: Can't resolve 'fs'
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false
      };
    }

    return config;
  }
});
