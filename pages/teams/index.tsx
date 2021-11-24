import { Team } from ".prisma/client"
import Layout from "../../components/_Layout"
import { prettyTeamNames } from "../../config/teams"
import Link from "next/link"

const TeamDirectoryPage = (): React.ReactElement => (
  <Layout
    title="Teams"
    breadcrumbs={[
      {
        href: process.env.NEXT_PUBLIC_SOCIAL_CARE_APP_URL,
        text: "My workspace",
      },
      { current: true, text: "Teams" },
    ]}
  >
    <h1>Teams</h1>

    <ul className="lbh-list lbh-body-l">
      {Object.values(Team).map(team => (
        <li key={team}>
          <Link href={`/teams/${team.toLowerCase()}`}>
            {prettyTeamNames[team]}
          </Link>
        </li>
      ))}
    </ul>
  </Layout>
)

export default TeamDirectoryPage
