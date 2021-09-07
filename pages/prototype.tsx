import Link from "next/link"
import Layout from "../components/_Layout"

const PrototypeWelcome = (): React.ReactElement => (
  <div
    style={{
      filter: "grayscale(1)",
    }}
  >
    <Layout title="Prototype">
      <p>
        This is a <strong>fake page</strong> meant to make it easier to find
        important flows.
      </p>

      <Link href="/workflows/new?social_care_id=1">
        <a className="govuk-button lbh-button">Start a new workflow</a>
      </Link>
      <br />
    </Layout>
  </div>
)

export default PrototypeWelcome
