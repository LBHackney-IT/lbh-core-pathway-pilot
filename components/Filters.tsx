import { Status } from "../types"
import forms from "../config/forms"
import Link from "next/link"
import { useSession } from "next-auth/client"
import { useQueryState } from "use-location-state"

const Filters = (): React.ReactElement => {
  const [session] = useSession()
  const approver = session.user.approver

  const [status, setStatus] = useQueryState("status", "")
  const [formId, setFormId] = useQueryState("form_id", "StringParam")
  const [onlyReviews, setOnlyReviews] = useQueryState(
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
            name="filter-status"
            onChange={e => setStatus(e.target.value)}
          >
            <option value="" selected={status === ""}>
              All
            </option>
            {Object.keys(Status).map(opt => (
              <option key={opt} value={opt} selected={opt === status}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div className="govuk-form-group lbh-form-group">
          <label className="govuk-label lbh-label" htmlFor="filter-type">
            Filter by type
          </label>
          <select
            className="govuk-select lbh-select"
            id="filter-type"
            name="filter-type"
            onChange={e => setFormId(e.target.value)}
          >
            <option value="" selected={formId === ""}>
              All
            </option>
            {forms.map(opt => (
              <option key={opt.id} value={opt.id} selected={formId === opt.id}>
                {opt.name}
              </option>
            ))}
          </select>
        </div>

        <div className="govuk-checkboxes lbh-checkboxes">
          <div className="govuk-checkboxes__item">
            <input
              className="govuk-checkboxes__input"
              id="only-reviews-reassessments"
              name="only-reviews-reassessments"
              type="checkbox"
              checked={onlyReviews}
              onChange={e => setOnlyReviews(e.target.checked)}
            />
            <label
              className="govuk-label govuk-checkboxes__label"
              htmlFor="only-reviews-reassessments"
            >
              Only reviews and reassessments
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
