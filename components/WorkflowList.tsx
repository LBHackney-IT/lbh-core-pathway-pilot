import WorkflowPanel, { WorkflowForPanel } from "../components/WorkflowPanel"
import s from "./WorkflowList.module.scss"
import cx from "classnames"
import { useSession } from "next-auth/client"
import useLocalStorage from "../hooks/useLocalStorage"

interface Props {
  workflows: WorkflowForPanel[]
}

enum Filter {
  Me = "Assigned to me",
  Team = "Team",
  All = "All",
}

const WorkflowList = ({ workflows }: Props): React.ReactElement => {
  const [filter, setFilter] = useLocalStorage<Filter>("tab", Filter.Me)
  const [session] = useSession()

  const results = {}

  results[Filter.All] = workflows
  results[Filter.Team] = workflows.filter(
    workflow => workflow.teamAssignedTo === session?.user?.team
  )
  results[Filter.Me] = workflows.filter(
    workflow => workflow.assignedTo === session?.user?.email
  )

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
          {results[filter].length > 0 ? (
            results[filter].map(result => (
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
