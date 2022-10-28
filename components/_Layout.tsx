import Header from "../components/Header"
import PhaseBanner from "../components/PhaseBanner"
import Head from "next/head"
import Breadcrumbs, { Crumb } from "./Breadcrumbs"
import { FlashMessages } from "../contexts/flashMessages"

import s from "../styles/LeftSidebar.module.scss"
import { useEffect } from "react"
import { initGA, logPageView } from "../lib/analytics"
import ActivityFeed from "./ActivityFeed"

interface Props {
  /** set a new document title */
  title?: string
  /** layout should be full-width */
  fullWidth?: boolean
  /** content for the breadcrumbs area */
  breadcrumbs?: Crumb[]
  /** children */
  announcementArea?: React.ReactChild | React.ReactChild[]
  children: React.ReactChild | React.ReactChild[]
}

const Layout = ({
  title,
  fullWidth,
  children,
  announcementArea,
  breadcrumbs,
}: Props): React.ReactElement => {
  useEffect(() => {
    if (!window.GA_INITIALIZED) {
      initGA()
      window.GA_INITIALIZED = true
    }
    logPageView()
  }, [])

  return (
    <>
      {title && (
        <Head>
          <title>{title} | Social care | Hackney Council</title>
        </Head>
      )}

      <a href="#main-content" className="govuk-skip-link lbh-skip-link">
        Skip to main content
      </a>

      <div className={fullWidth ? s.fullHeightWrapper : s.plainWrapper}>
        <Header fullWidth={fullWidth} />
        <PhaseBanner fullWidth={fullWidth} />
        <section className="lbh-announcement lbh-announcement--site lbh-announcement--site--warning">
          <div className="lbh-container">
            <h3 className="lbh-announcement__title">DO <span className="underline">NOT</span> RECORD HERE !</h3>
            <div className="lbh-announcement__content">
              <p>
                All information needs to be entered onto Mosaic only.<br />

                See the <a href="https://intranet.hackney.gov.uk/mosaic-for-adults-social-care"> Adults Social Care Mosaic Pages </a> on the intranet
              </p>
            </div>
          </div>
        </section>

        {announcementArea}

        {breadcrumbs && (
          <Breadcrumbs crumbs={breadcrumbs} fullWidth={fullWidth} />
        )}

        {fullWidth ? (
          <main className={s.fullHeightMain} id="main-content" role="main">
            {children}
          </main>
        ) : (
          <main className="lbh-main-wrapper" id="main-content" role="main">
            <div className="lbh-container">
              <FlashMessages />
              {children}
            </div>
          </main>
        )}

        <ActivityFeed />
      </div>
    </>
  )
}

export default Layout
