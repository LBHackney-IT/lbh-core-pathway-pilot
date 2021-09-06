import { Sort, Status } from "../types"
import forms from "../config/forms"
import Link from "next/link"
import { useSession } from "next-auth/client"
import useQueryState from "../hooks/useQueryState"

const statusFilters = {
  All: "",
  "In progress": Status.InProgress,
  "Submitted for approval": Status.Submitted,
  "Approved by manager": Status.ManagerApproved,
  "No action": Status.NoAction,
  "Review soon": Status.ReviewSoon,
}

const Filters = (): React.ReactElement => {
  const [session] = useSession()
  const approver = session?.user?.approver

  const [status, setStatus] = useQueryState<string>("status", "")
  const [formId, setFormId] = useQueryState<string>("form_id", "")
  const [sort, setSort] = useQueryState<Sort>("sort", "")
  const [onlyReviews, setOnlyReviews] = useQueryState<boolean>(
    "only_reviews_reassessments",
    false
  )

  return (
    <details className="govuk-details lbh-details govuk-!-margin-bottom-8">
      <summary className="govuk-details__summary">
        <span className="govuk-details__summary-text">Filter and sort</span>
      </summary>
      <div className="govuk-details__text">
        <div className="govuk-form-group lbh-form-group">
          <label className="govuk-label lbh-label" htmlFor="filter-status">
            Filter by status
          </label>
          <select
            className="govuk-select lbh-select"
            id="filter-status"
            onChange={e => setStatus(e.target.value)}
            value={status}
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
            onChange={e => setFormId(e.target.value)}
            value={formId}
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
          <label className="govuk-label lbh-label" htmlFor="sort">
            Sort by
          </label>
          <select
            className="govuk-select lbh-select"
            id="sort"
            onChange={e => setSort(e.target.value as Sort)}
            value={sort}
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
              checked={!!onlyReviews}
              onChange={e => setOnlyReviews(e.target.checked)}
            />
            <label
              className="govuk-label govuk-checkboxes__label"
              htmlFor="only-reviews-reassessments"
            >
              Only show reassessments
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
