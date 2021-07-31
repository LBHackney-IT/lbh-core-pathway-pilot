import Document, { Html, Head, Main, NextScript } from "next/document"

class CustomDocument extends Document {
  render(): React.ReactElement {
    return (
      <Html lang="en" className="govuk-template lbh-template">
        <Head />
        <body className="govuk-template__body">
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default CustomDocument
