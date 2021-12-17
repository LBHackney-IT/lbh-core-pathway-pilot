import {Team} from ".prisma/client"
import Layout from "../../components/_Layout"
import {prettyTeamNames} from "../../config/teams"
import Link from "next/link"
import {protectRoute} from "../../lib/protectRoute";

type Props = {
  teams: [keyof typeof Team]
}
const TeamDirectoryPage = ({ teams }: Props): React.ReactElement => (
    <Layout
      title="Teams"
      breadcrumbs={[
        {
          href: process.env.NEXT_PUBLIC_SOCIAL_CARE_APP_URL,
          text: "My workspace",
        },
        {current: true, text: "Teams"},
      ]}
    >
      <h1>Teams</h1>

      <ul className="lbh-list lbh-body-l">
        {teams.map(team => (
          <li key={team}>
            <Link href={`/teams/${team.toLowerCase()}`}>
              {prettyTeamNames[team]}
            </Link>
          </li>
        ))}
      </ul>
    </Layout>
  )

export const getServerSideProps = protectRoute(async () => {
  return {
    props: {
      teams: Object.values(Team),
    },
  };
}, [])

export default TeamDirectoryPage
