import { Form, Sort, Status } from "../types"
import Link from "next/link"
import { useSession } from "next-auth/client"
import useQueryState from "../hooks/useQueryState"
import { logEvent } from "../lib/analytics"
import { useEffect } from "react"
import { useRouter } from "next/router"
import useUsers from "../hooks/useUsers"

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
}

const Filters = ({ forms }: Props): React.ReactElement => {
  const [session] = useSession()
  const approver = session?.user?.approver

  const { data: users } = useUsers()

  const [status, setStatus] = useQueryState<string>("status", "", ["page"])
  const [formId, setFormId] = useQueryState<string>("form_id", "", ["page"])
  const [assignedTo, setAssignedTo] = useQueryState<string>("assigned_to", "", [
    "page",
  ])
  const [sort, setSort] = useQueryState<Sort>("sort", "")
  const [onlyReviews, setOnlyReviews] = useQueryState<boolean>(
    "only_reviews_reassessments",
    false,
    ["page"]
  )
  const [showHistoric, setShowHistoric] = useQueryState<boolean>(
    "show_historic",
    false,
    ["page"]
  )
  const [onlyMine, setOnlyMine] = useQueryState<boolean>("only_mine", false, [
    "page",
  ])

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
          <label className="govuk-label lbh-label" htmlFor="filter-assigned-to">
            Assigned to
          </label>
          <select
            className="govuk-select lbh-select"
            id="filter-assigned-to"
            onChange={e => setAssignedTo(e.target.value)}
            value={assignedTo}
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
              id="show-historic"
              type="checkbox"
              checked={!!showHistoric}
              onChange={e => setShowHistoric(e.target.checked)}
            />
            <label
              className="govuk-label govuk-checkboxes__label"
              htmlFor="show-historic"
            >
              Show historic workflows
            </label>
          </div>

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

          <div className="govuk-checkboxes__item">
            <input
              className="govuk-checkboxes__input"
              id="only-mine"
              type="checkbox"
              checked={!!onlyMine}
              onChange={e => setOnlyMine(e.target.checked)}
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
