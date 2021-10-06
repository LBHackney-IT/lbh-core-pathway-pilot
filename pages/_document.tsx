import Document, {DocumentContext, Html, Head, Main, NextScript, DocumentInitialProps} from "next/document"
import {generateCSP, generateNonce} from "../lib/contentSecurity";
import { token } from '../lib/csrfToken';

class CustomDocument extends Document<{ nonce?: string, csrfToken: string }> {
  static async getInitialProps(ctx: DocumentContext): Promise<DocumentInitialProps & { nonce?: string, csrfToken: string }> {
    const res = ctx?.res
    const nonce = generateNonce();
    const csrfToken = token();

    if (res != null) {
      res.setHeader('XSRF-TOKEN', csrfToken);

      if (process.env.NODE_ENV === 'production') {
        res.setHeader('Content-Security-Policy', generateCSP(nonce));
      }
    }

    return {...(await Document.getInitialProps(ctx)), nonce, csrfToken};
  }

  render(): React.ReactElement {
    return (
      <Html lang="en" className="govuk-template lbh-template">
        <Head nonce={this.props.nonce}>
          <meta httpEquiv="XSRF-TOKEN" content={this.props.csrfToken} />
        </Head>
        <body className="govuk-template__body">
          <Main />
          <NextScript nonce={this.props.nonce} />
        </body>
      </Html>
    )
  }
}

export default CustomDocument
