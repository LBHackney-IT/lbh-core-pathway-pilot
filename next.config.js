const { join } = require("path")
const CopyWebpackPlugin = require("copy-webpack-plugin")
const { withSentryConfig } = require("@sentry/nextjs")

module.exports = withSentryConfig(
  {
    distDir: "build/_next",
    target: "server",
    poweredByHeader: false,
    redirects: () => [
      {
        source: "/workflows",
        destination: "/",
        permanent: true,
      },
      {
        source: "/sign-in",
        destination: "/",
        permanent: true,
      },
    ],
    webpack: (config, { isServer }) => {
      if (isServer) return config

      config.plugins.push(
        new CopyWebpackPlugin({
          patterns: [
            {
              from: join(__dirname, "public/favicon.ico"),
              to: join(__dirname, "build/"),
            },
          ],
        })
      )

      return config
    },
    async headers() {
      const headers = [
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
              key: "X-XSS-Protection",
              value: "1; mode=block",
            },
          ],
        },

        {
          source: "/api/workflows",
          headers: [
            {
              key: "Access-Control-Allow-Origin",
              value: "*.hackney.gov.uk",
            },
          ],
        },
      ]

      if (process.env.NODE_ENV === "production") {
        headers[0].headers.push({
          key: "Content-Security-Policy",
          value:
            "connect-src 'self' o183917.ingest.sentry.io; " +
            "default-src 'self' fonts.googleapis.com fonts.gstatic.com www.googletagmanager.com; " +
            "frame-ancestors 'self'; " +
            "form-action 'self';",
        })
      }

      return headers
    },
  },
  {
    org: "london-borough-of-hackney",
    project: "social-care-pathways-app",
    authToken: process.env.SENTRY_AUTH_TOKEN,
    dryRun: !["dev", "stg", "prod"].includes(process.env.ENVIRONMENT),
  }
)
