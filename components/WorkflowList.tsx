import WorkflowPanel, { WorkflowForPanel } from "../components/WorkflowPanel"
import s from "./WorkflowList.module.scss"
import cx from "classnames"
import { useSession } from "next-auth/client"
import useLocalStorage from "../hooks/useLocalStorage"
import { useEffect } from "react"
import { logEvent } from "../lib/analytics"
import useQueryState from "../hooks/useQueryState"

interface Props {
  workflows: WorkflowForPanel[]
}

export enum Filter {
  Me = "Work assigned to me",
  Team = "Team",
  All = "All",
}

const WorkflowList = ({ workflows }: Props): React.ReactElement => {
  const [filter, setFilter] = useQueryState<Filter>("tab", Filter.All)

  useEffect(() => {
    logEvent("dashboard assignment tab changed", filter)
  }, [filter])

  const results = {}

  return (
    <div className={s.outer}>
      {workflows.length > 0 ? (
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
                  {tab} ({results[tab]?.length})
                </button>
              </li>
            ))}
          </ul>
          {workflows.length > 0 ? (
            workflows.map(result => (
              <WorkflowPanel key={result.id} workflow={result} />
            ))
          ) : (
            <p className={s.noResults}>No results match your filters.</p>
          )}
        </div>
      ) : (
        <p className={s.noResults}>No results to show</p>
      )}
    </div>
  )
}

export default WorkflowList
