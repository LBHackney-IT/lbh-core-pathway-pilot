import CustomDocument from "../pages/_document"
import {DocumentContext} from "next/document";
import {RenderPageResult} from "next/dist/shared/lib/utils";

const switchEnv = (environment) => {
  const oldEnv = process.env.NODE_ENV
  process.env.NEXT_PUBLIC_ENV = environment
  // @ts-ignore
  process.env.NODE_ENV = environment

  return () => switchEnv(oldEnv)
};

jest.mock('../lib/contentSecurity', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...jest.requireActual("../lib/contentSecurity") as any,
  generateNonce: jest.fn().mockReturnValue("test"),
}));

const mockContext: DocumentContext = {
  // @ts-ignore
  res: { setHeader: jest.fn() },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  renderPage: (options = {}):  RenderPageResult | Promise<RenderPageResult> => {
    return {
      html: "<div/>",
      head: [(<div key='test'/>)],
    };
  },
};

beforeEach(() => (mockContext.res.setHeader as jest.Mock).mockClear());

describe("getInitialProps in production", () => {
  let switchBack;

  beforeAll(() => switchBack = switchEnv("production"))
  afterAll(() => switchBack())

  it("sets an appropriate Content-Security-Policy header", async () => {
    await CustomDocument.getInitialProps(mockContext);

    expect(mockContext.res.setHeader).toHaveBeenCalledWith(
      'Content-Security-Policy',
      "default-src 'self' *.hackney.gov.uk hackney.gov.uk; " +
      "style-src 'self' 'nonce-test'; " +
      "style-src-elem 'self' 'nonce-test' fonts.googleapis.com; " +
      "script-src 'self' 'nonce-test'; " +
      "script-src-elem 'self' 'nonce-test'; " +
      "font-src 'self' fonts.gstatic.com;",
    );
  })
})

describe("getInitialProps in testing", () => {
  let switchBack;

  beforeAll(() => switchBack = switchEnv("test"))
  afterAll(() => switchBack())

  it("does not set a Content-Security-Policy header", async () => {
    await CustomDocument.getInitialProps(mockContext);

    expect(mockContext.res.setHeader).not.toHaveBeenCalled();
  })
})
