import React from "react"
import Head from "next/head"
import {AppProps} from "next/app"
import "../styles/index.scss"
import "../styles/helpers.scss"
import {FlashMessageProvider} from "../contexts/flashMessages"
import {Session} from "../lib/auth/SessionContext";
import {SWRConfig} from "swr"
import {authenticatedFetch} from "../lib/fetch";

if (typeof window !== "undefined") {
  document.body.className = document.body.className
    ? document.body.className + " js-enabled"
    : "js-enabled"
}

const App = ({Component, pageProps}: AppProps): React.ReactElement => {
  return (
    <Session>
      <SWRConfig value={{
        fetcher: (resource, init) =>
          authenticatedFetch(resource, init)
            .then(res => (res as Response).json()),
      }}>
        <FlashMessageProvider>
          <Head>
            <title>Social care | Hackney Council</title>
            <meta charSet="utf-8"/>
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1, viewport-fit=cover"
            />
            <meta name="theme-color" content="#0b0c0c"/>
            <meta httpEquiv="X-UA-Compatible" content="IE=edge"/>
          </Head>

          <Component {...pageProps} />
        </FlashMessageProvider>
      </SWRConfig>
    </Session>
  )
}

export default App
