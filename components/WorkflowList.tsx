import WorkflowPanel, { WorkflowForPanel } from "../components/WorkflowPanel"
import s from "./WorkflowList.module.scss"
import cx from "classnames"
import { useEffect } from "react"
import { logEvent } from "../lib/analytics"
import useQueryState from "../hooks/useQueryState"
import Pagination from "./Pagination";

interface Props {
  workflows: WorkflowForPanel[],
  workflowTotals: {
    "All": number,
    "Work assigned to me": number,
    "Team": number,
  }
}

export enum Filter {
  Me = "Work assigned to me",
  Team = "Team",
  All = "All",
}

const WorkflowList = ({ workflows, workflowTotals }: Props): React.ReactElement => {
  const [filter, setFilter] = useQueryState<Filter>("tab", Filter.Me)

  useEffect(() => {
    logEvent("dashboard assignment tab changed", filter)
  }, [filter])

  return (
    <div className={s.outer}>
      <div className="govuk-tabs lbh-tabs">
        <ul className={s.tabList}>
          {Object.values(Filter).map(tab => (
            <li
              key={tab}
              className={cx("lbh-body", s.tab, {
                [s.active]: filter === tab,
              })}
            >
              <button
                onClick={() => setFilter(tab)}
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
          <Pagination total={workflowTotals[filter]}/>
          </>
        ) : (
          <p className={s.noResults}>No results match your filters.</p>
        )}
      </div>
    </div>
  )
}

export default WorkflowList
