import Layout from "../components/_Layout"
import Link from "next/link"

const Unauthorised = (): React.ReactElement => (
  <Layout title="You don't have permission to sign in">
    <h1>Sign into the main social care tool first</h1>

    <p>We need to check you have permission to sign in. To do this:</p>

    <ul class="lbh-list lbh-list--number">
      <li>
        Sign into the{" "}
        <a
          href={`${process.env.NEXT_PUBLIC_SOCIAL_CARE_APP_URL}/login`}
          className="lbh-link"
          rel="noreferrer"
          target="_blank"
        >
          main social care tool
        </a>{" "}
        in a new tab.
      </li>
      <li>
        Then, come back here and <Link href="/sign-in">sign in again</Link>.
      </li>
    </ul>

    <p>
      If you&apos;re still having trouble,{" "}
      <a
        href="https://forms.gle/pVuBfxcm2kqxT8D68"
        className="lbh-link"
        target="_blank"
        rel="noreferrer"
      >
        let us know
      </a>
      .
    </p>
    <p>We will ask you to complete these steps first.</p>
  </Layout>
)

export default Unauthorised
