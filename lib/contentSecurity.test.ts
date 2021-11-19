import { generateCSP, generateNonce } from "./contentSecurity"

beforeAll(() => jest.spyOn(global.Math, "random").mockReturnValue(0.123456789))
afterAll(() => jest.spyOn(global.Math, "random").mockRestore())

describe("generating a nonce value", () => {
  test("creates a random string", () => {
    expect(generateNonce()).toBe(
      "4fzzzxjylrx4fzzzxjylrx4fzzzxjylrx4fzzzxjylrx4fzzzxjylrx"
    )
  })
})

describe("generating the desired CSP from a nonce", () => {
  test("generates the expected CSP header", () => {
    expect(generateCSP(generateNonce())).toBe(
      "connect-src 'self' www.google-analytics.com o183917.ingest.sentry.io; " +
        "default-src 'self'; " +
        "font-src 'self' fonts.gstatic.com; " +
        "form-action 'self'; " +
        "frame-ancestors 'self'; " +
        "img-src 'self' www.google-analytics.com lh3.googleusercontent.com; " +
        "script-src 'self' 'nonce-4fzzzxjylrx4fzzzxjylrx4fzzzxjylrx4fzzzxjylrx4fzzzxjylrx' www.google-analytics.com; " +
        "script-src-elem 'self' 'nonce-4fzzzxjylrx4fzzzxjylrx4fzzzxjylrx4fzzzxjylrx4fzzzxjylrx' www.googletagmanager.com; " +
        "style-src 'self' 'nonce-4fzzzxjylrx4fzzzxjylrx4fzzzxjylrx4fzzzxjylrx4fzzzxjylrx' fonts.googleapis.com; " +
        "style-src-elem 'self' 'nonce-4fzzzxjylrx4fzzzxjylrx4fzzzxjylrx4fzzzxjylrx4fzzzxjylrx' fonts.googleapis.com;"
    )
  })
})
