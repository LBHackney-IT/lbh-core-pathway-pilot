import { Prisma, Team } from ".prisma/client"
import { GetServerSideProps } from "next"
import { useRouter } from "next/router"
import TeamMemberPanel from "../../components/TeamMemberPanel"
import Layout from "../../components/_Layout"
import { prettyTeamNames } from "../../config/teams"
import prisma from "../../lib/prisma"
import { protectRoute } from "../../lib/protectRoute"

const UserForTeamPage = Prisma.validator<Prisma.UserArgs>()({
  include: {
    sessions: {
      select: {
        updatedAt: true,
      },
      take: 1,
      orderBy: {
        updatedAt: "desc",
      },
    },
    assignments: true,
  },
})
export type UserForTeamPage = Prisma.UserGetPayload<typeof UserForTeamPage>

interface Props {
  users: UserForTeamPage[]
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
      <h1>{prettyTeamNames[team]} team</h1>

      <h2>Last 30 days</h2>

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-quarter">
          <div className="lbh-stat">
            <strong
              className="lbh-stat__value"
              aria-labelledby="stat-1-caption"
            >
              12
            </strong>
            <span className="lbh-stat__caption" id="stat-1-caption">
              Workflows started
            </span>
          </div>
        </div>
        <div className="govuk-grid-column-one-quarter">
          <div className="lbh-stat">
            <strong
              className="lbh-stat__value"
              aria-labelledby="stat-2-caption"
            >
              48
            </strong>
            <span className="lbh-stat__caption" id="stat-2-caption">
              Workflows approved
            </span>
          </div>
        </div>
        <div className="govuk-grid-column-one-quarter">
          <div className="lbh-stat">
            <strong
              className="lbh-stat__value"
              aria-labelledby="stat-3-caption"
            >
              275
            </strong>
            <span className="lbh-stat__caption" id="stat-3-caption">
              Workflows authorised
            </span>
          </div>
        </div>

        <div className="govuk-grid-column-one-quarter">
          <div className="lbh-stat">
            <strong
              className="lbh-stat__value"
              aria-labelledby="stat-3-caption"
            >
              275
            </strong>
            <span className="lbh-stat__caption" id="stat-3-caption">
              Workflows completed
            </span>
          </div>
        </div>
      </div>

      <h2>Team members</h2>

      <div>
        {users.map(user => (
          <TeamMemberPanel user={user} key={user.id} />
        ))}
      </div>
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
      include: {
        sessions: {
          select: {
            updatedAt: true,
          },
          take: 1,
          orderBy: {
            updatedAt: "desc",
          },
        },
        assignments: true,
      },
    })

    return {
      props: {
        users: JSON.parse(JSON.stringify(users)),
      },
    }
  }
)
