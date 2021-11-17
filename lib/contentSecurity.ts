const policy: CSPPolicy = {
  "connect-src": ["'self'", "www.google-analytics.com", "o183917.ingest.sentry.io"],
  "default-src": ["'self'"],
  "font-src": ["'self'", "fonts.gstatic.com"],
  "form-action": ["'self'"],
  "frame-ancestors": ["'self'"],
  "img-src": ["'self'", "www.google-analytics.com"],
  "script-src": ["'self'", "{nonce}", "www.google-analytics.com"],
  "script-src-elem": ["'self'", "{nonce}", "www.googletagmanager.com"],
  "style-src": ["'self'", "{nonce}", "fonts.googleapis.com"],
  "style-src-elem": ["'self'", "{nonce}", "fonts.googleapis.com"],
}

export type CSPDirective =
  | "default-src"
  | "connect-src"
  | "style-src"
  | "script-src"
  | "font-src"
  | "frame-src"
  | "img-src"
  | "style-src-elem"
  | "frame-ancestors"
  | "form-action"
  | "script-src-elem"

export type CSPPolicy = {
  [key in CSPDirective]?: Array<string>
}

export type CSPHeader = {
  [key in CSPDirective]?: Array<string>
}

export const generateNonce = (): string =>
  new Array(5)
    .fill(null)
    .map(() => Math.random().toString(36).substring(2))
    .join("")

export const generateCSP = (nonce: string): string => {
  const header: CSPHeader = {}

  if (policy)
    Object.entries(policy).forEach(([directive, values]) => {
      if (isDirective(directive)) {
        header[directive] = (header[directive] || []).concat(
          values.map(d => (d === "{nonce}" ? `'nonce-${nonce}'` : d))
        )
      }
    })

  return Object.entries(header)
    .map(
      ([directiveName, directiveValues]) =>
        directiveName + " " + directiveValues.join(" ")
    )
    .map(c => `${c};`)
    .join(" ")
}

const isDirective = (input: unknown): input is CSPDirective =>
  [
    "default-src",
    "connect-src",
    "style-src",
    "script-src",
    "font-src",
    "frame-src",
    "img-src",
    "style-src-elem",
    "script-src-elem",
    "frame-ancestors",
    "form-action",
  ].includes(input as string)
