import "../styles/index.scss"
import Head from "next/head"
import { Provider } from "next-auth/client"
import Header from "../components/Header"
import Layout from "../components/_Layout"
import PhaseBanner from "../components/PhaseBanner"

if (typeof window !== "undefined") {
  document.body.className = document.body.className
    ? document.body.className + " js-enabled"
    : "js-enabled"
}

const App = ({ Component, pageProps }) => (
  <Provider session={pageProps.session}>
    <Head>
      <title>Social care | Hackney Council</title>
      <meta charSet="utf-8" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, viewport-fit=cover"
      />
      <meta name="theme-color" content="#0b0c0c" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
    </Head>
    <a href="#main-content" className="govuk-skip-link lbh-skip-link">
      Skip to main content
    </a>

    <Layout>
      <>
        <a href="#main-content" className="govuk-skip-link lbh-skip-link">
          Skip to main content
        </a>
        <Header />

        <PhaseBanner />

        <main className="lbh-main-wrapper" id="main-content" role="main">
          <div className="lbh-container">
            <Component {...pageProps} />
          </div>
        </main>
      </>
    </Layout>
  </Provider>
)

export default App
