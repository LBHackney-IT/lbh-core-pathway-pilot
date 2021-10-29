import { Form, Status } from "../types"
import Link from "next/link"
import { useSession } from "next-auth/client"
import { logEvent } from "../lib/analytics"
import { useEffect } from "react"
import { useRouter } from "next/router"
import useUsers from "../hooks/useUsers"
import { QueryParams } from "../hooks/useQueryParams"

const statusFilters = {
  All: "",
  "In progress": Status.InProgress,
  "Submitted for approval": Status.Submitted,
  "Approved by manager": Status.ManagerApproved,
  "No action": Status.NoAction,
  "Review soon": Status.ReviewSoon,
}

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
    <details className="govuk-details lbh-details govuk-!-margin-bottom-8">
      <summary className="govuk-details__summary">
        <span className="govuk-details__summary-text">Filter and sort</span>
      </summary>
      <div className="govuk-details__text">
        <div className="govuk-checkboxes lbh-checkboxes">
          <div className="govuk-form-group lbh-form-group">
            <label className="govuk-label lbh-label" htmlFor="social-care-id">
              Social care ID
            </label>
            <input
              className="govuk-input lbh-input govuk-input--width-10"
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
        </div>

        <div className="govuk-form-group lbh-form-group">
          <label className="govuk-label lbh-label" htmlFor="filter-status">
            Filter by status
          </label>
          <select
            className="govuk-select lbh-select"
            id="filter-status"
            onChange={e => {
              updateQueryParams({ status: e.target.value, page: null })
            }}
            value={queryParams["status"] as string}
          >
            {Object.entries(statusFilters).map(([label, val]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="govuk-form-group lbh-form-group">
          <label className="govuk-label lbh-label" htmlFor="filter-form">
            Filter by assessment
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
            Assigned to
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
          </select>
        </div>

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
              Only show reassessments
            </label>
          </div>
        </div>

        <div className="govuk-checkboxes lbh-checkboxes">
          <div className="govuk-checkboxes__item">
            <input
              className="govuk-checkboxes__input"
              id="only-mine"
              type="checkbox"
              checked={!!queryParams["only_mine"]}
              onChange={e => {
                updateQueryParams({ only_mine: e.target.checked, page: null })
              }}
            />
            <label
              className="govuk-label govuk-checkboxes__label"
              htmlFor="only-mine"
            >
              Only show workflows created by me
            </label>
          </div>
        </div>

        {approver && (
          <Link href="/discarded">
            <a className="lbh-link lbh-link--muted">See discarded workflows</a>
          </Link>
        )}
      </div>
    </details>
  )
}

export default Filters
