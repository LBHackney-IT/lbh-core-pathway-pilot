import Document, {DocumentContext, Html, Head, Main, NextScript, DocumentInitialProps} from "next/document"
import {generateCSP, generateNonce} from "../lib/contentSecurity";

class CustomDocument extends Document<{ nonce?: string }> {
  static async getInitialProps(ctx: DocumentContext): Promise<DocumentInitialProps & { nonce?: string }> {
    const res = ctx?.res
    const nonce = generateNonce();

    if (process.env.NODE_ENV === 'production' && res != null) {
      res.setHeader('Content-Security-Policy', generateCSP({
        'default-src': ["'self'", '*.hackney.gov.uk', 'hackney.gov.uk'],
        'style-src': ["'self'", `'nonce-${nonce}'`],
        'style-src-elem': ["'self'", `'nonce-${nonce}'`, "fonts.googleapis.com"],
        'script-src': ["'self'", `'nonce-${nonce}'`],
        'script-src-elem': ["'self'", `'nonce-${nonce}'`],
        'font-src': ["'self'", "fonts.gstatic.com"],
      }));
    }

    return {...(await Document.getInitialProps(ctx)), nonce};
  }

  render(): React.ReactElement {
    return (
      <Html lang="en" className="govuk-template lbh-template">
        <Head nonce={this.props.nonce} />
        <body className="govuk-template__body">
          <Main />
          <NextScript nonce={this.props.nonce} />
        </body>
      </Html>
    )
  }
}

export default CustomDocument
