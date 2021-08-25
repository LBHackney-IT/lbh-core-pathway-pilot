import Layout from "../components/_Layout"
import { GetServerSideProps } from "next"
import { getSession, useSession } from "next-auth/client"
import prisma from "../lib/prisma"
import { UserWithSession } from "../types"
import { prettyDateToNow } from "../lib/formatters"
import { Field, Form, Formik } from "formik"
import FormStatusMessage from "../components/FormStatusMessage"
import { Team } from "@prisma/client"
import s from "../styles/Users.module.scss"
import {
  AutosaveIndicator,
  AutosaveTrigger,
  AutosaveProvider,
} from "../contexts/autosaveContext"
import { prettyTeamNames } from "../config/teams"

interface InitialValues {
  [key: string]: {
    approver: boolean
    panelApprover: boolean
    team?: Team
  }
}

const PermissionCheckbox = ({ name, label }) => (
  <td className="govuk-table__cell">
    <div className="govuk-checkboxes__item">
      <Field
        type="checkbox"
        name={name}
        id={name}
        className="govuk-checkboxes__input"
      />
      <label className="govuk-label govuk-checkboxes__label" htmlFor={name}>
        <span className="govuk-visually-hidden">{label}</span>
      </label>
    </div>
  </td>
)

const UsersPage = ({
  users,
}: {
  users: UserWithSession[]
}): React.ReactElement => {
  const [session] = useSession()

  const initialValues: InitialValues = users.reduce((acc, user) => {
    acc[user.id] = {
      team: user.team,
      approver: user.approver,
      panelApprover: user.panelApprover,
    }
    return acc
  }, {})

  const handleSubmit = async (values: InitialValues, { setStatus }) => {
    try {
      // 1. filter out only users which have changed
      const changed = Object.fromEntries(
        Object.entries(values).filter(
          ([userId, data]) =>
            JSON.stringify(data) !== JSON.stringify(initialValues[userId])
        )
      )

      // 2. make an api request for every changed user
      await Promise.all(
        Object.entries(changed).map(([userId, data]) =>
          fetch(`/api/users/${userId}`, {
            method: "PATCH",
            body: JSON.stringify({
              approver: data.approver,
              panelApprover: data.panelApprover,
              team: data.team || undefined,
            }),
          })
        )
      )
    } catch (e) {
      setStatus(e.toString())
    }
  }

  return (
    <AutosaveProvider>
      <Layout
        title="Team members"
        breadcrumbs={[
          { href: "#", text: "Dashboard" },
          { href: "/", text: "Workflows" },
          { text: "Team members", current: true },
        ]}
      >
        <h1 className="govuk-!-margin-bottom-8">Users</h1>

        <AutosaveIndicator />

        <Formik initialValues={initialValues} onSubmit={handleSubmit}>
          <Form>
            <AutosaveTrigger delay={2000} />

            <FormStatusMessage />

            <table className={`govuk-table lbh-table ${s.table}`}>
              <thead className="govuk-table__head">
                <tr className="govuk-table__row">
                  <th scope="col" className="govuk-table__header">
                    User
                  </th>
                  <th scope="col" className="govuk-table__header">
                    Approver?
                  </th>
                  <th scope="col" className="govuk-table__header">
                    Panel approver?
                  </th>
                  <th scope="col" className="govuk-table__header">
                    Team
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
                        <strong>{user.name}</strong>{" "}
                        {user.email === session?.user?.email && (
                          <span className={s.you}>(you)</span>
                        )}
                      </p>

                      <p className="lbh-body-xs govuk-!-margin-top-0">
                        {user.email}
                      </p>
                    </th>

                    <PermissionCheckbox
                      name={`${user.id}.approver`}
                      label="Approver?"
                    />

                    <PermissionCheckbox
                      name={`${user.id}.panelApprover`}
                      label="Panel approver?"
                    />

                    <td className="govuk-table__cell">
                      <Field
                        as="select"
                        name={`${user.id}.team`}
                        className="govuk-select lbh-select"
                      >
                        <option value="">No team</option>
                        {Object.entries(Team).map(([key, val]) => (
                          <option key={val} value={val}>
                            {prettyTeamNames[key]}
                          </option>
                        ))}
                      </Field>
                    </td>

                    <td className="govuk-table__cell">
                      {prettyDateToNow(String(user.sessions?.[0]?.updatedAt))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Form>
        </Formik>
      </Layout>
    </AutosaveProvider>
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
          updatedAt: true,
        },
        take: 1,
        orderBy: {
          updatedAt: "desc",
        },
      },
    },
    orderBy: [
      { team: "asc" },
      { panelApprover: "desc" },
      { approver: "desc" },
      { name: "asc" },
    ],
  })

  return {
    props: {
      users: JSON.parse(JSON.stringify(users)),
    },
  }
}

export default UsersPage
