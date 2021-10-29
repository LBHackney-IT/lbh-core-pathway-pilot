import WorkflowPanel, { WorkflowForPanel } from "../components/WorkflowPanel"
import s from "./WorkflowList.module.scss"
import cx from "classnames"
import { useEffect } from "react"
import { logEvent } from "../lib/analytics"
import { QueryParams } from "../hooks/useQueryParams"

interface Props {
  workflows: WorkflowForPanel[]
  workflowTotals: {
    All: number
    "Work assigned to me": number
    Team: number
  }
  queryParams: QueryParams
  updateQueryParams: (queryParams) => void
}

export enum Filter {
  Me = "Work assigned to me",
  Team = "Team",
  All = "All",
}

const WorkflowList = ({
  workflows,
  workflowTotals,
  queryParams,
  updateQueryParams,
}: Props): React.ReactElement => {
  useEffect(() => {
    logEvent("dashboard assignment tab changed", queryParams["tab"] as string)
  }, [queryParams])

  return (
    <div className={s.outer}>
      <div className="govuk-tabs lbh-tabs">
        <ul className={s.tabList}>
          {Object.values(Filter).map(tab => (
            <li
              key={tab}
              className={cx("lbh-body", s.tab, {
                [s.active]: queryParams["tab"] === tab,
              })}
            >
              <button
                onClick={() => {
                  updateQueryParams({ tab, page: null })
                }}
                className={`lbh-link lbh-link--no-visited-state ${s.link}`}
              >
                {tab} ({workflowTotals[tab]})
              </button>
            </li>
          ))}
        </ul>
        {workflows.length > 0 ? (
          <>
            {workflows.map(result => (
              <WorkflowPanel key={result.id} workflow={result} />
            ))}
          </>
        ) : (
          <p className={s.noResults}>No results match your filters.</p>
        )}
      </div>
    </div>
  )
}

export default WorkflowList
