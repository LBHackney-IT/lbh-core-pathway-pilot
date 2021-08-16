import s from "../styles/Filters.module.scss"
import { Status } from "../types"
import forms from "../config/forms"
import Link from "next/link"
import { useSession } from "next-auth/client"

const Filters = (): React.ReactElement => {
  const [session] = useSession()
  const approver = session.user.approver

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
          >
            <option value="">All</option>
            {Object.keys(Status).map(status => (
              <option key={status} value={status}>
                {status}
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
          >
            <option value="">All</option>
            {forms.map(form => (
              <option key={form.id} value={form.id}>
                {form.name}
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
