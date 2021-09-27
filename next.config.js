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
            key: 'Content-Security-Policy',
            value:
              "default-src 'self' hackney.gov.uk *.hackney.gov.uk;" +
              "object-src 'none';" +
              "connect-src 'self' www.google-analytics.com;" +
              "script-src-elem 'self' 'unsafe-inline' www.googletagmanager.com;" +
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' www.googletagmanager.com;" +
              "style-src 'self' 'unsafe-inline' fonts.googleapis.com fonts.gstatic.com;" +
              "font-src 'self' fonts.googleapis.com fonts.gstatic.com;" +
              "frame-ancestors 'self';" +
              "form-action 'self';",
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
