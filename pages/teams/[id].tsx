import { Team, User } from ".prisma/client"
import { GetServerSideProps } from "next"
import { useRouter } from "next/router"
import Layout from "../../components/_Layout"
import { prettyTeamNames } from "../../config/teams"
import prisma from "../../lib/prisma"
import { protectRoute } from "../../lib/protectRoute"

interface Props {
  users: User[]
}

const TeamPage = ({ users }: Props): React.ReactElement => {
  const { query } = useRouter()

  const team = query.id as Team

  return (
    <Layout
      title={prettyTeamNames[team]}
      breadcrumbs={[
        {
          href: process.env.NEXT_PUBLIC_SOCIAL_CARE_APP_URL,
          text: "My workspace",
        },
        {
          href: `/workflows`,
          text: "Workflows",
        },
        { current: true, text: "Team" },
      ]}
    >
      <h1>{prettyTeamNames[team]}</h1>

      <h2>Performance</h2>

      <h2>Team members</h2>

      <ul>
        {users.length && users?.map(user => <li key={user.id}>{user.name}</li>)}
      </ul>
    </Layout>
  )
}

export default TeamPage

export const getServerSideProps: GetServerSideProps = protectRoute(
  async req => {
    const team = req.query.id as Team

    const users = await prisma.user.findMany({
      where: {
        team,
      },
    })

    return {
      props: {
        users: JSON.parse(JSON.stringify(users)),
      },
    }

    // return {
    //   props: JSON.parse(JSON.stringify(users)),
    // }
  }
)
