import Layout from "../components/_Layout"

const Unauthorised = (): React.ReactElement => (
  <Layout title="You don't have permission to sign in">
    <h1>You don&apos;t have permission to sign in</h1>

    <p>
      If you don&apos;t think this is correct,{" "}
      <a
        href={`${process.env.NEXT_PUBLIC_SOCIAL_CARE_APP_URL}/login`}
        className="lbh-link lbh-link--no-visited-state"
        rel="noreferrer"
      >
        sign into the main social care tool
      </a>{" "}
      first.
    </p>
    <p>
      If you&apos;re still having trouble signing in,{" "}
      <a
        href="https://forms.gle/pVuBfxcm2kqxT8D68"
        className="lbh-link lbh-link--no-visited-state"
        target="_blank"
        rel="noreferrer"
      >
        let us know
      </a>
      .
    </p>
  </Layout>
)

export default Unauthorised
