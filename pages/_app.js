import "../styles/index.scss"
import Head from "next/head"

if (typeof window !== "undefined") {
  document.body.className = document.body.className
    ? document.body.className + " js-enabled"
    : "js-enabled"
}

const App = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta name="theme-color" content="#0b0c0c" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      </Head>
      {/* Skip link goes here */}
      {/* Cookie banner goes here */}
      {/* Header goes here */}
      {/* Phase banner goes here */}
      {/* Announcements go here */}
      {/* Breadcrumbs go here */}
      <main className="lbh-main-wrapper" id="main-content" role="main">
        <div className="lbh-container">
          {/* Main content components go here */}
          <Component {...pageProps} />
        </div>
      </main>
    </>
  )
}

export default App
