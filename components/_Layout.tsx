import Head from "next/head"
import { useRouter } from "next/router"
import { useSession, Provider } from "next-auth/client"
import Header from "../components/Header"

const PUBLIC_PATHS = ["/sign-in"]

interface Props {
  children: React.ReactChild
}

const App = ({ children }: Props): React.ReactElement => {
  const [session, isLoading] = useSession()
  const { pathname, replace } = useRouter()

  if (session || PUBLIC_PATHS.includes(pathname))
    return (
      <>
        <a href="#main-content" className="govuk-skip-link lbh-skip-link">
          Skip to main content
        </a>
        <Header />

        <div className="govuk-phase-banner lbh-phase-banner lbh-container">
          <p className="govuk-phase-banner__content">
            <strong className="govuk-tag govuk-phase-banner__content__tag lbh-tag">
              Prototype
            </strong>
            <span className="govuk-phase-banner__text">
              This is an experimental service. Some parts may not work.
            </span>
          </p>
        </div>

        <main className="lbh-main-wrapper" id="main-content" role="main">
          <div className="lbh-container">{children}</div>
        </main>
      </>
    )

  if (!session && !isLoading) replace(`/sign-in`)

  return <p>Loading...</p>
}

export default App
