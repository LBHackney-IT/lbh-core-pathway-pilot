import { Prisma, Team } from ".prisma/client"
import { GetServerSideProps } from "next"
import TeamMemberPanel from "../../components/TeamMemberPanel"
import TeamStats from "../../components/TeamStats"
import Layout from "../../components/_Layout"
import formsForThisEnv from "../../config/forms"
import { prettyTeamNames } from "../../config/teams"
import prisma from "../../lib/prisma"
import { protectRoute } from "../../lib/protectRoute"
import { Form } from "../../types"

const UserForTeamPage = Prisma.validator<Prisma.UserArgs>()({
  include: {
    assignments: true,
  },
})
export type UserForTeamPage = Prisma.UserGetPayload<typeof UserForTeamPage>

interface Props {
  team: Team
  users: UserForTeamPage[]
  forms: Form[]
}

const TeamPage = ({ users, team, forms }: Props): React.ReactElement => {
  return (
    <Layout
      title={prettyTeamNames[team]}
      breadcrumbs={[
        {
          href: process.env.NEXT_PUBLIC_SOCIAL_CARE_APP_URL,
          text: "My workspace",
        },
        {
          href: `/teams`,
          text: "Teams",
        },
        { current: true, text: "Team" },
      ]}
    >
      <h1>{prettyTeamNames[team]} team</h1>

      <h2>Last 30 days</h2>

      <TeamStats team={team} />

      <h2>Members</h2>

      <div>
        {users.map(user => (
          <TeamMemberPanel user={user} key={user.id} forms={forms} />
        ))}
      </div>
    </Layout>
  )  
}

export default TeamPage

export const getServerSideProps: GetServerSideProps = protectRoute(
  async req => {
    const { id } = req.query

    // get the team
    const team = Object.values(Team).find(
      team => (id as string).toLowerCase() === team.toLowerCase()
    )

    if(!team) {
      return { props: {}, notFound: true }
    }
    
    const users = await prisma.user.findMany({
      where: {
        team,
      },
      orderBy: {
        name: "asc",
      },
      include: {
        assignments: {
          where: {
            discardedAt: null,
          },
        },
      },
    })

    const forms = await formsForThisEnv()

    return {
      props: {
        team,
        users: JSON.parse(JSON.stringify(users)),
        forms,
      },
    }
  }
)
