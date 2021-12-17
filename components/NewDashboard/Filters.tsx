import { useRouter } from "next/router"
import {useContext, useEffect} from "react"
import useUsers from "../../hooks/useUsers"
import { logEvent } from "../../lib/analytics"
import s from "./Filters.module.scss"
import { Form } from "../../types"
import Link from "next/link"
import { Team } from ".prisma/client"
import { prettyTeamNames } from "../../config/teams"
import {
  QuickFilterOpts,
  WorkflowQueryParams as QueryParams,
} from "../../hooks/useWorkflows"
import UserOptions from "../UserSelect"
import {SessionContext} from "../../lib/auth/SessionContext";

const Radio = ({ name, label, value, queryParams, updateQueryParams }) => (
  <div className="govuk-radios__item">
    <input
      className="govuk-radios__input"
      id={`${name}-~-${value}`}
      type="radio"
      value={value}
      checked={queryParams[name] === value}
      onChange={() => updateQueryParams({ [name]: value })}
    />
    <label
      className="govuk-label govuk-radios__label"
      htmlFor={`${name}-~-${value}`}
    >
      {label}
    </label>
  </div>
)

interface Props {
  forms: Form[]
  queryParams: QueryParams
  updateQueryParams: (queryParams: QueryParams) => void
}

const Filters = ({
  queryParams,
  updateQueryParams,
}: Props): React.ReactElement => {
  const session = useContext(SessionContext)
  const approver = session?.approver

  const { data: users } = useUsers()
  const { query } = useRouter()

  useEffect(() => {
    logEvent("dashboard filters changed", JSON.stringify(query))
  }, [query])

  return (
    <nav className={s.outer}>
      <div className="govuk-form-group lbh-form-group">
        <label className={s.legendLabel} htmlFor="social-care-id">
          Social care ID
        </label>
        <input
          className="govuk-input lbh-input govuk-input--width-5"
          id="social-care-id"
          value={queryParams["social_care_id"] as string}
          placeholder="eg. 12345"
          onChange={e => {
            updateQueryParams({
              social_care_id: e.target.value as string,
            })
          }}
        />
      </div>

      <fieldset className="govuk-form-group lbh-form-group govuk-fieldset">
        <legend className={s.legendLabel}>Assigned to</legend>

        <div className="govuk-radios lbh-radios  govuk-radios--conditional">
          <Radio
            name="quick_filter"
            label="Me"
            value={QuickFilterOpts.Me}
            queryParams={queryParams}
            updateQueryParams={updateQueryParams}
          />

          {queryParams["quick_filter"] === QuickFilterOpts.Me && (
            <div className="govuk-radios__conditional govuk-checkboxes lbh-checkboxes">
              <div className="govuk-checkboxes__item">
                <input
                  className="govuk-checkboxes__input"
                  id="touched-by-me"
                  type="checkbox"
                  checked={!!queryParams["touched_by_me"]}
                  onChange={e => {
                    if (e.target.checked) {
                      updateQueryParams({ touched_by_me: true })
                    } else {
                      updateQueryParams({
                        touched_by_me: undefined,
                      })
                    }
                  }}
                />
                <label
                  className="govuk-label govuk-checkboxes__label"
                  htmlFor="touched-by-me"
                >
                  Also include things I&apos;ve interacted with
                </label>
              </div>
            </div>
          )}

          {session?.team && (
            <Radio
              name="quick_filter"
              label={`My team`}
              value={QuickFilterOpts.MyTeam}
              queryParams={queryParams}
              updateQueryParams={updateQueryParams}
            />
          )}

          <Radio
            name="quick_filter"
            label="Another team"
            value={QuickFilterOpts.AnotherTeam}
            queryParams={queryParams}
            updateQueryParams={updateQueryParams}
          />

          {users &&
            queryParams["quick_filter"] === QuickFilterOpts.AnotherTeam && (
              <div className="govuk-radios__conditional">
                <label
                  htmlFor="team_assigned_to"
                  className="govuk-label lbh-label"
                >
                  Which team?
                </label>
                <select
                  className="govuk-select lbh-select"
                  id="team_assigned_to"
                  onChange={e => {
                    updateQueryParams({
                      team_assigned_to: e.target.value as Team,
                    })
                  }}
                  value={queryParams["team_assigned_to"] as string}
                >
                  <option value=""></option>

                  {Object.keys(Team).map(team => (
                    <option key={team} value={team}>
                      {prettyTeamNames[team]}
                    </option>
                  ))}
                </select>

                <div className="govuk-!-margin-top-2">
                  {queryParams["team_assigned_to"] && (
                    <Link
                      href={`/teams/${queryParams[
                        "team_assigned_to"
                      ].toLowerCase()}`}
                    >
                      <a className="lbh-link lbh-link--muted">See team page</a>
                    </Link>
                  )}
                </div>
              </div>
            )}

          <Radio
            name="quick_filter"
            label="Another user"
            value={QuickFilterOpts.AnotherUser}
            queryParams={queryParams}
            updateQueryParams={updateQueryParams}
          />

          {queryParams["quick_filter"] === QuickFilterOpts.AnotherUser && (
            <div className="govuk-radios__conditional">
              <label htmlFor="assigned_to" className="govuk-label lbh-label">
                Who?
              </label>
              <select
                className="govuk-select lbh-select"
                id="assigned_to"
                onChange={e => {
                  updateQueryParams({ assigned_to: e.target.value })
                }}
                value={queryParams["assigned_to"] as string}
              >
                <UserOptions users={users} />
              </select>
            </div>
          )}

          <Radio
            name="quick_filter"
            label="All"
            value={QuickFilterOpts.All}
            queryParams={queryParams}
            updateQueryParams={updateQueryParams}
          />
        </div>
      </fieldset>

      <fieldset className="govuk-form-group lbh-form-group govuk-fieldset">
        <legend className={s.legendLabel}>Types</legend>

        <div className="govuk-checkboxes lbh-checkboxes">
          <div className="govuk-checkboxes__item">
            <input
              className="govuk-checkboxes__input"
              id="show-historic"
              type="checkbox"
              checked={!!queryParams["show_historic"]}
              onChange={e => {
                if (e.target.checked) {
                  updateQueryParams({ show_historic: true })
                } else {
                  updateQueryParams({
                    show_historic: undefined,
                  })
                }
              }}
            />
            <label
              className="govuk-label govuk-checkboxes__label"
              htmlFor="show-historic"
            >
              Include historic work from before October 2021
            </label>
          </div>
        </div>
      </fieldset>

      {approver && (
        <Link href="/discarded">
          <a className="lbh-link lbh-link--muted">See discarded workflows</a>
        </Link>
      )}
    </nav>
  )
}

export default Filters
