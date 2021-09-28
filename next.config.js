const {join} = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  distDir: 'build/_next',
  target: 'server',
  poweredByHeader: false,
  webpack: (config, {isServer}) => {
    if (isServer) return config;

    config.plugins.push(new CopyWebpackPlugin({
      patterns: [
        {
          from: join(__dirname, 'public/favicon.ico'),
          to: join(__dirname, 'build/'),
        },
      ],
    }));

    return config
  },
  async headers() {
    return [
      {
        source: "/(.*)?",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },
}
