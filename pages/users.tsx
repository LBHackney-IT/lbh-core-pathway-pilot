import Layout from "../components/_Layout"
import { GetServerSideProps } from "next"
import { getSession } from "next-auth/client"
import prisma from "../lib/prisma"
import { UserWithSession } from "../types"
import { prettyDateToNow } from "../lib/formatters"

const UsersPage = ({
  users,
}: {
  users: UserWithSession[]
}): React.ReactElement => {
  return (
    <Layout
      title="Team members"
      breadcrumbs={[
        { href: "#", text: "Dashboard" },
        { href: "/", text: "Workflows" },
        { text: "Team members", current: true },
      ]}
    >
      <h1 className="govuk-!-margin-bottom-8">Users</h1>

      <table className="govuk-table lbh-table">
        <thead className="govuk-table__head">
          <tr className="govuk-table__row">
            <th scope="col" className="govuk-table__header">
              User
            </th>
            <th scope="col" className="govuk-table__header">
              Team
            </th>
            <th scope="col" className="govuk-table__header">
              Approver?
            </th>
            <th scope="col" className="govuk-table__header">
              Last seen
            </th>
          </tr>
        </thead>

        <tbody className="govuk-table__body">
          {users.map(user => (
            <tr key={user.id} className="govuk-table__row">
              <th scope="row" className="govuk-table__cell">
                <p>
                  <strong>{user.name}</strong>
                </p>

                <p className="lbh-body-xs govuk-!-margin-top-0">{user.email}</p>
              </th>
              <td className="govuk-table__cell">{user.team || "No team"}</td>
              <td className="govuk-table__cell">
                {user.approver ? "Yes" : "No"}
              </td>
              <td className="govuk-table__cell">
                {prettyDateToNow(String(user.sessions?.[0]?.createdAt))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const session = await getSession({ req })

  // redirect if user isn't an approver
  if (!session.user.approver) {
    return {
      props: {},
      redirect: {
        destination: "/",
      },
    }
  }

  const users = await prisma.user.findMany({
    include: {
      sessions: {
        select: {
          createdAt: true,
        },
        take: 1,
        orderBy: {
          createdAt: "desc",
        },
      },
    },
    orderBy: [{ team: "asc" }, { approver: "desc" }, { name: "asc" }],
  })

  return {
    props: {
      users: JSON.parse(JSON.stringify(users)),
    },
  }
}

export default UsersPage
