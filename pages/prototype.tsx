import Link from "next/link"
import Layout from "../components/_Layout"

const PrototypeWelcome = (): React.ReactElement => (
  <Layout title="Prototype">
    <h1>Choose a flow</h1>
    <Link href="/workflows/new?social_care_id=1">
      <a className="govuk-button lbh-button">Start a new workflow</a>
    </Link>
    <br />
    <Link href="/">
      <a className="govuk-button lbh-button">Inspect or resume a workflow</a>
    </Link>
    <br />
    <Link href="/reviews/new?id=cks4m2j1m2938dgvawyr4rk8h">
      <a className="govuk-button lbh-button">Review a workflow</a>
    </Link>
  </Layout>
)

export default PrototypeWelcome
