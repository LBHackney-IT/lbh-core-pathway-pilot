import Link from "next/link"
import Layout from "../components/_Layout"

const PrototypeWelcome = (): React.ReactElement => (
  <div style={{
    filter: "grayscale(1)"
  }}>


  <Layout title="Prototype">
    <h1>Choose a flow</h1>

    <p>This is a <strong>fake page</strong> meant to make it easier to find important flows.</p>
    
    <Link href="/workflows/new?social_care_id=1">
      <a className="govuk-button lbh-button">1. Start a new workflow</a>
    </Link>
    <br />
    <Link href="/">
      <a className="govuk-button lbh-button">2. Inspect or resume a workflow</a>
    </Link>
    <br />
    <Link href="/reviews/new?id=cks8trpre00180gvam88trsol">
      <a className="govuk-button lbh-button">3. Review or reassess a workflow</a>
    </Link>
  </Layout>
  </div>
)

export default PrototypeWelcome
