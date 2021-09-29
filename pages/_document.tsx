import Document, {DocumentContext, Html, Head, Main, NextScript, DocumentInitialProps} from "next/document"
import {generateCSP, generateNonce} from "../lib/contentSecurity";

class CustomDocument extends Document<{ nonce?: string }> {
  static async getInitialProps(ctx: DocumentContext): Promise<DocumentInitialProps & { nonce?: string }> {
    const res = ctx?.res
    const nonce = generateNonce();

    if (process.env.NODE_ENV === 'production' && res != null) {
      res.setHeader('Content-Security-Policy', generateCSP(nonce));
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
