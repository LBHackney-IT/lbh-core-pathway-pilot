import Layout from "../components/_Layout"
import { GetServerSideProps } from "next"
import { getSession, useSession } from "next-auth/client"
import prisma from "../lib/prisma"
import { EditableUserValues, UserWithSession } from "../types"
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
import { generateUsersSchema } from "../lib/validators"
import { csrfFetch } from "../lib/csrfToken"
import { protectRoute } from "../lib/protectRoute"
import useSearch from "../hooks/useSearch"
import { useState } from "react"

interface PermissionCheckboxProps {
  name: string
  label: string
  disabled?: boolean
}

const PermissionCheckbox = ({
  name,
  label,
  disabled,
}: PermissionCheckboxProps) => (
  <td className="govuk-table__cell">
    <div className="govuk-checkboxes__item">
      <Field
        type="checkbox"
        name={name}
        id={name}
        className="govuk-checkboxes__input"
        disabled={disabled}
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
  const [query, setQuery] = useState("")
  const results = useSearch(query, users, ["email", "team", "name"], {
    threshold: 0.3,
  })

  const initialValues: EditableUserValues = users.reduce((acc, user) => {
    acc[user.id] = {
      email: user.email,
      team: user.team,
      approver: user.approver,
      panelApprover: user.panelApprover,
    }
    return acc
  }, {})

  const handleSubmit = async (values: EditableUserValues, { setStatus }) => {
    try {
      const res = await csrfFetch(`/api/users`, {
        method: "PATCH",
        body: JSON.stringify(values),
      })
      if (!res.ok) throw res.status
    } catch (e) {
      setStatus(e.toString())
    }
  }

  return (
    <AutosaveProvider>
      <Layout
        title="Team members"
        breadcrumbs={[
          {
            href: process.env.NEXT_PUBLIC_SOCIAL_CARE_APP_URL,
            text: "My workspace",
          },
          { href: "/", text: "Workflows" },
          { text: "Users", current: true },
        ]}
      >
        <h1 className="govuk-!-margin-bottom-8">Team members</h1>

        <div className="govuk-form-group lbh-form-group lbh-search-box">
          <label className="govuk-visually-hidden" htmlFor="search">
            Search
          </label>
          <input
            className="govuk-input lbh-input govuk-input--width-10"
            id="search"
            name="search"
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search..."
          />
          {query.length > 0 && (
            <button
              className="lbh-search-box__action"
              onClick={() => setQuery("")}
            >
              <span className="govuk-visually-hidden">Clear search</span>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path
                  d="M-0.0501709 1.36379L1.36404 -0.050415L12.6778 11.2633L11.2635 12.6775L-0.0501709 1.36379Z"
                  fill="#0B0C0C"
                />
                <path
                  d="M11.2635 -0.050293L12.6778 1.36392L1.36404 12.6776L-0.0501709 11.2634L11.2635 -0.050293Z"
                  fill="#0B0C0C"
                />
              </svg>
            </button>
          )}
        </div>

        {query.length > 0 && (
          <p className="lbh-body-s">
            Showing {results.length} result{results.length !== 1 && "s"}
          </p>
        )}

        <AutosaveIndicator />

        <Formik
          initialValues={initialValues}
          onSubmit={handleSubmit}
          validationSchema={generateUsersSchema(users)}
        >
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
                    QAM authoriser?
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
                {results.map(user => (
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
                      disabled={user.email === session.user.email}
                    />

                    <PermissionCheckbox
                      name={`${user.id}.panelApprover`}
                      label="QAM authoriser?"
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

export const getServerSideProps: GetServerSideProps = protectRoute(
  async ({ req }) => {
    const session = await getSession({ req })

    // redirect if user isn't an approver
    if (!session.user?.approver) {
      return {
        props: {},
        redirect: {
          destination: "/",
        },
      }
    }

    const users = await prisma.user.findMany({
      where: {
        historic: false,
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
)

export default UsersPage
