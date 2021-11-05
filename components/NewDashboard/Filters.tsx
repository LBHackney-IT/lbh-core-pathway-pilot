import { useSession } from "next-auth/client"
import { useRouter } from "next/router"
import { useEffect } from "react"
import useUsers from "../../hooks/useUsers"
import { logEvent } from "../../lib/analytics"
import s from "./Filters.module.scss"
import { QueryParams } from "../../hooks/useQueryParams"
import { Form } from "../../types"
import Link from "next/link"

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
        <label className="govuk-label lbh-label" htmlFor="social-care-id">
          Social care ID
        </label>
        <input
          className="govuk-input lbh-input govuk-input--width-5"
          id="social-care-id"
          value={queryParams["social_care_id"] as string}
          onChange={e => {
            updateQueryParams({
              social_care_id: e.target.value,
              page: null,
            })
          }}
        />
      </div>

      <div className="govuk-form-group lbh-form-group">
        <label className="govuk-label lbh-label" htmlFor="filter-form">
          Assessment type
        </label>
        <select
          className="govuk-select lbh-select"
          id="filter-form"
          onChange={e => {
            updateQueryParams({ form_id: e.target.value, page: null })
          }}
          value={queryParams["form_id"] as string}
        >
          <option value="">All</option>
          {forms.map(opt => (
            <option key={opt.id} value={opt.id}>
              {opt.name}
            </option>
          ))}
        </select>
      </div>

      <div className="govuk-form-group lbh-form-group">
        <label className="govuk-label lbh-label" htmlFor="filter-assigned-to">
          Assignee
        </label>
        <select
          className="govuk-select lbh-select"
          id="filter-assigned-to"
          onChange={e => {
            updateQueryParams({ assigned_to: e.target.value, page: null })
          }}
          value={queryParams["assigned_to"] as string}
        >
          <option value="">All</option>
          {users?.map(opt => (
            <option key={opt.id} value={opt.email}>
              {opt.name} ({opt.email})
            </option>
          ))}
        </select>
      </div>

      <div className="govuk-form-group lbh-form-group">
        <label className="govuk-label lbh-label" htmlFor="sort">
          Sort by
        </label>
        <select
          className="govuk-select lbh-select"
          id="sort"
          onChange={e => {
            updateQueryParams({ sort: e.target.value, page: null })
          }}
          value={queryParams["sort"] as string}
        >
          <option value="">Recently updated</option>
          <option value="recently-started">Recently started</option>
          <option value="oldest-started">Oldest started</option>
        </select>
      </div>

      <div className="govuk-checkboxes lbh-checkboxes">
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
      </div>

      {approver && (
        <Link href="/discarded">
          <a className="lbh-link lbh-link--muted">See discarded workflows</a>
        </Link>
      )}
    </nav>
  )
}

export default Filters
