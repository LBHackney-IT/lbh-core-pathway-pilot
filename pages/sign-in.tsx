import { GetServerSideProps } from "next"
import {
  providers,
  signIn,
  getSession,
  ClientSafeProvider,
} from "next-auth/client"

import Layout from "../components/_Layout"
import { protectRoute } from "../lib/protectRoute"

interface Props {
  provider: ClientSafeProvider
}

const SignInPage = ({ provider }: Props): React.ReactElement => (
  <Layout title="Sign in">
    <h1 className="lbh-heading-h1">Sign in</h1>
    <button
      onClick={() => signIn(provider.id)}
      className="govuk-button lbh-button  lbh-button--start govuk-button--start"
    >
      Sign in with Google
      <svg
        className="govuk-button__start-icon"
        xmlns="http://www.w3.org/2000/svg"
        width="17.5"
        height="19"
        viewBox="0 0 33 40"
        role="presentation"
        focusable="false"
      >
        <path fill="currentColor" d="M0 0h13l20 20-20 20H0l20-20z" />
      </svg>
    </button>

    <p className="lbh-body">Please log in with your Hackney email account.</p>

    <p className="lbh-body">
      You must sign into the{" "}
      <a
        href={`${process.env.NEXT_PUBLIC_SOCIAL_CARE_APP_URL}/login`}
        className="lbh-link"
        rel="noreferrer"
        target="_blank"
      >
        main social care tool
      </a>{" "}
      first.
    </p>

    <p className="lbh-body">
      Speak to your manager if you have issues logging in.
    </p>
  </Layout>
)

export const getServerSideProps: GetServerSideProps = protectRoute(
  async ({ req, res }) => {
    const session = await getSession({ req })

    if (session && res && session.accessToken) {
      res.writeHead(302, {
        Location: "/",
      })
      res.end()
    }

    const activeProviders = await providers()
    return {
      props: { provider: Object.values(activeProviders)[0] },
    }
  }
)

export default SignInPage
