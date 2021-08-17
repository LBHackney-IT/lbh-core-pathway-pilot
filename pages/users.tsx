import Layout from "../components/_Layout"
import { GetServerSideProps } from "next"
import { getSession } from "next-auth/client"
import prisma from "../lib/prisma"
import { UserWithSession } from "../types"
import { prettyDateToNow } from "../lib/formatters"
import { Field, Form, Formik } from "formik"
import FormStatusMessage from "../components/FormStatusMessage"
import { Team } from "@prisma/client"
import s from "../styles/Users.module.scss"

const UsersPage = ({
  users,
}: {
  users: UserWithSession[]
}): React.ReactElement => {
  const handleSubmit = () => {}

  const initialValues = users.reduce((acc, user) => {
    acc[user.id] = {
      team: user.team,
      approver: user.approver,
    }
    return acc
  }, {})

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

      <Formik initialValues={initialValues} onSubmit={handleSubmit}>
        {({ isSubmitting }) => (
          <Form>
            <FormStatusMessage />

            <table className={`govuk-table lbh-table ${s.table}`}>
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

                      <p className="lbh-body-xs govuk-!-margin-top-0">
                        {user.email}
                      </p>
                    </th>

                    <td className="govuk-table__cell">
                      <Field
                        as="select"
                        name={`${user.id}.team`}
                        className="govuk-select lbh-select"
                      >
                        <option value="">No team</option>
                        {Object.entries(Team).map(([key, val]) => (
                          <option key={val} value={val}>
                            {key}
                          </option>
                        ))}
                      </Field>
                    </td>

                    <td className="govuk-table__cell">
                      <div className="govuk-checkboxes__item">
                        <Field
                          type="checkbox"
                          name={`${user.id}.approver`}
                          className="govuk-checkboxes__input"
                        />
                        <label
                          className="govuk-label govuk-checkboxes__label"
                          htmlFor="nationality"
                        >
                          <span className="govuk-visually-hidden">
                            Approver?
                          </span>
                        </label>
                      </div>
                    </td>

                    <td className="govuk-table__cell">
                      {prettyDateToNow(String(user.sessions?.[0]?.createdAt))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button disabled={isSubmitting} className="govuk-button lbh-button">
              Save changes
            </button>
          </Form>
        )}
      </Formik>
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
