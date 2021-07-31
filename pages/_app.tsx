import Head from "next/head"
import { Provider } from "next-auth/client"
import ProtectedPage from "../components/ProtectedPage"

import "../styles/index.scss"
import "../styles/helpers.scss"

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

    <ProtectedPage>
      <Component {...pageProps} />
    </ProtectedPage>
  </Provider>
)

export default App
