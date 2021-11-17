import CustomDocument from "../pages/_document"
import { DocumentContext } from "next/document"
import { RenderPageResult } from "next/dist/shared/lib/utils"

process.env.CSRF_SECRET = "test-secret"

const switchEnv = environment => {
  const oldEnv = process.env.NODE_ENV
  process.env.NEXT_PUBLIC_ENV = environment
  // @ts-ignore
  process.env.NODE_ENV = environment

  return () => switchEnv(oldEnv)
}

jest.mock("../lib/contentSecurity", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...(jest.requireActual("../lib/contentSecurity") as any),
  generateNonce: jest.fn().mockReturnValue("test"),
}))

const mockContext: DocumentContext = {
  // @ts-ignore
  res: { setHeader: jest.fn() },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  renderPage: (options = {}): RenderPageResult | Promise<RenderPageResult> => {
    return {
      html: "<div/>",
      head: [<div key="test" />],
    }
  },
}

beforeEach(() => (mockContext.res.setHeader as jest.Mock).mockClear())

describe("getInitialProps", () => {
  it("sets an XSRF header", async () => {
    await CustomDocument.getInitialProps(mockContext)

    expect(mockContext.res.setHeader).toHaveBeenCalledWith(
      "XSRF-TOKEN",
      expect.anything()
    )
  })
})

describe("getInitialProps in production", () => {
  let switchBack

  beforeAll(() => (switchBack = switchEnv("production")))
  afterAll(() => switchBack())

  it("sets an appropriate Content-Security-Policy header", async () => {
    await CustomDocument.getInitialProps(mockContext)

    expect(mockContext.res.setHeader).toHaveBeenCalledWith(
      "Content-Security-Policy",
      "connect-src 'self' www.google-analytics.com o183917.ingest.sentry.io; " +
      "default-src 'self'; " +
      "font-src 'self' fonts.gstatic.com; " +
      "form-action 'self'; " +
      "frame-ancestors 'self'; " +
      "img-src 'self' www.google-analytics.com; " +
      "script-src 'self' 'nonce-test' www.google-analytics.com; " +
      "script-src-elem 'self' 'nonce-test' www.googletagmanager.com; " +
      "style-src 'self' 'nonce-test' fonts.googleapis.com; " +
      "style-src-elem 'self' 'nonce-test' fonts.googleapis.com;"
    )
  })
})

describe("getInitialProps in testing", () => {
  let switchBack

  beforeAll(() => (switchBack = switchEnv("test")))
  afterAll(() => switchBack())

  it("does not set a Content-Security-Policy header", async () => {
    await CustomDocument.getInitialProps(mockContext)

    expect(mockContext.res.setHeader).not.toHaveBeenCalledWith(
      "Content-Security-Policy",
      expect.anything()
    )
  })
})
