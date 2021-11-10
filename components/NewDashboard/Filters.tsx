import { useSession } from "next-auth/client"
import { useRouter } from "next/router"
import { useEffect } from "react"
import useUsers from "../../hooks/useUsers"
import { logEvent } from "../../lib/analytics"
import s from "./Filters.module.scss"
import { Form } from "../../types"
import Link from "next/link"
import { Team } from ".prisma/client"
import { prettyTeamNames } from "../../config/teams"

interface QueryParams {
  quick_filter?: QuickFilterOpts
  assigned_to?: string
  team_assigned_to?: Team
  show_historic?: true
  only_reassessments?: true
}

enum QuickFilterOpts {
  "all",
  "me",
  "my-team",
  "another-team",
  "another-user",
}

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
  updateQueryParams: (queryParams) => void
}

const Filters = ({
  queryParams,
  updateQueryParams,
}: Props): React.ReactElement => {
  const [session] = useSession()
  const approver = session?.user?.approver

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
              social_care_id: e.target.value,
              page: null,
            })
          }}
        />
      </div>

      <fieldset className="govuk-form-group lbh-form-group govuk-fieldset">
        <legend className={s.legendLabel}>Assignee</legend>

        <div className="govuk-radios lbh-radios  govuk-radios--conditional">
          <Radio
            name="quick_filter"
            label="All"
            value={QuickFilterOpts.all}
            queryParams={queryParams}
            updateQueryParams={updateQueryParams}
          />

          <Radio
            name="quick_filter"
            label="Me"
            value={QuickFilterOpts.me}
            queryParams={queryParams}
            updateQueryParams={updateQueryParams}
          />

          {session.user.team && (
            <Radio
              name="quick_filter"
              label={`My team`}
              value={QuickFilterOpts["my-team"]}
              queryParams={queryParams}
              updateQueryParams={updateQueryParams}
            />
          )}

          <Radio
            name="quick_filter"
            label="Another team"
            value={QuickFilterOpts["another-team"]}
            queryParams={queryParams}
            updateQueryParams={updateQueryParams}
          />

          {queryParams["quick_filter"] === QuickFilterOpts["another-team"] && (
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
                    team_assigned_to: e.target.value,
                  })
                }}
                value={queryParams["team_assigned_to"] as string}
              >
                {Object.keys(Team).map(team => (
                  <option key={team} value={team}>
                    {prettyTeamNames[team]}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Radio
            name="quick_filter"
            label="Another user"
            value={QuickFilterOpts["another-user"]}
            queryParams={queryParams}
            updateQueryParams={updateQueryParams}
          />

          {queryParams["quick_filter"] === QuickFilterOpts["another-user"] && (
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
                {users?.map(opt => (
                  <option key={opt.id} value={opt.email}>
                    {opt.name} ({opt.email})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </fieldset>

      <fieldset className="govuk-form-group lbh-form-group govuk-fieldset">
        <legend className={s.legendLabel}>Types</legend>

        <div className="govuk-checkboxes lbh-checkboxes">
          <div className="govuk-checkboxes__item">
            <input
              className="govuk-checkboxes__input"
              id="only-reassessments"
              type="checkbox"
              checked={!!queryParams["only_reassessments"]}
              onChange={e => {
                updateQueryParams({
                  only_reassessments: e.target.checked,
                })
              }}
            />
            <label
              className="govuk-label govuk-checkboxes__label"
              htmlFor="only-reassessments"
            >
              Include reassessments
            </label>
          </div>

          <div className="govuk-checkboxes__item">
            <input
              className="govuk-checkboxes__input"
              id="show-historic"
              type="checkbox"
              checked={!!queryParams["show_historic"]}
              onChange={e =>
                updateQueryParams({
                  show_historic: e.target.checked,
                })
              }
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
