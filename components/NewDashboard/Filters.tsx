import { useSession } from "next-auth/client"
import { useRouter } from "next/router"
import { useEffect } from "react"
import useUsers from "../../hooks/useUsers"
import { logEvent } from "../../lib/analytics"
import s from "./Filters.module.scss"
import { QueryParams } from "../../hooks/useQueryParams"
import { Form } from "../../types"
import Link from "next/link"
import { Team } from ".prisma/client"
import { prettyTeamNames } from "../../config/teams"

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
  forms,
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
        <legend className={s.legendLabel}>Assessment type</legend>

        <div className="govuk-radios lbh-radios">
          <Radio
            name="form_id"
            label="All"
            value=""
            queryParams={queryParams}
            updateQueryParams={updateQueryParams}
          />
          {forms.map(opt => (
            <Radio
              key={opt.id}
              name="form_id"
              label={opt.name}
              value={opt.id}
              queryParams={queryParams}
              updateQueryParams={updateQueryParams}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="govuk-form-group lbh-form-group govuk-fieldset">
        <legend className={s.legendLabel}>Team</legend>

        <div className="govuk-radios lbh-radios">
          <Radio
            name="team_assigned_to"
            label="All"
            value=""
            queryParams={queryParams}
            updateQueryParams={updateQueryParams}
          />
          {Object.keys(Team).map(team => (
            <Radio
              key={team}
              name="team_assigned_to"
              label={prettyTeamNames[team]}
              value={team}
              queryParams={queryParams}
              updateQueryParams={updateQueryParams}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="govuk-form-group lbh-form-group govuk-fieldset">
        <legend className={s.legendLabel}>Assignee</legend>

        <div className="govuk-radios lbh-radios  govuk-radios--conditional">
          <Radio
            name="assignee"
            label="All"
            value=""
            queryParams={queryParams}
            updateQueryParams={updateQueryParams}
          />

          <Radio
            name="assignee"
            label="Me"
            value="me"
            queryParams={queryParams}
            updateQueryParams={updateQueryParams}
          />

          <Radio
            name="assignee"
            label="Someone else"
            value="someone-else"
            queryParams={queryParams}
            updateQueryParams={updateQueryParams}
          />

          <div className="govuk-radios__conditional">
            <label
              htmlFor="assignee-someone-else"
              className="govuk-label lbh-label"
            >
              Who?
            </label>
            <select
              className="govuk-select lbh-select"
              id="assignee-someone-else"
              onChange={e => {
                updateQueryParams({ assigned_to: e.target.value, page: null })
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
        </div>
      </fieldset>

      <fieldset className="govuk-form-group lbh-form-group govuk-fieldset">
        <legend className={s.legendLabel}>Sort by</legend>

        <div className="govuk-radios lbh-radios">
          <Radio
            name="sort"
            label="Recently updated"
            value=""
            queryParams={queryParams}
            updateQueryParams={updateQueryParams}
          />

          <Radio
            name="sort"
            label="Recently started"
            value="recently-started"
            queryParams={queryParams}
            updateQueryParams={updateQueryParams}
          />

          <Radio
            name="sort"
            label="Oldest started"
            value="oldest-started"
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
              id="only-reviews-reassessments"
              type="checkbox"
              checked={!!queryParams["only_reviews_reassessments"]}
              onChange={e => {
                updateQueryParams({
                  only_reviews_reassessments: e.target.checked,
                  page: null,
                })
              }}
            />
            <label
              className="govuk-label govuk-checkboxes__label"
              htmlFor="only-reviews-reassessments"
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
                  page: null,
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
