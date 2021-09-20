module.exports = {
  distDir: 'build/_next',
  target: 'server',
  poweredByHeader: false,
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
          // {
          //   key: "Content-Security-Policy",
          //   value:
          //     "default-src 'self' hackney.gov.uk *.hackney.gov.uk fonts.googleapis.com fonts.gstatic.com script-src 'unsafe-inline' style-src 'unsafe-inline' frame-ancestors self form-action self",
          // },
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
