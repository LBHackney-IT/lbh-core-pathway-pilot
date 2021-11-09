import { prettyStatuses } from "../../config/statuses"
import useLocalStorage from "../../hooks/useLocalStorage"
import { QueryParams } from "../../hooks/useQueryParams"
import useWorkflows from "../../hooks/useWorkflows"
import { Status } from "../../types"
import KanbanCard from "./KanbanCard"
import s from "./KanbanColumn.module.scss"

interface Props {
  status: Status
  query: QueryParams
}

const KanbanColumn = ({ status, query }: Props): React.ReactElement => {
  const [expanded, setExpanded] = useLocalStorage(
    `${status}-column-expanded`,
    true
  )

  const { data: workflows } = useWorkflows({
    ...query,
    status,
  })

  return (
    <section aria-expanded={expanded} className={s.outer}>
      <header className={s.header}>
        <h2 className="lbh-heading-h5">
          {prettyStatuses[status]} <span className={s.count}>(0)</span>
        </h2>

        <button onClick={() => setExpanded(!expanded)} className={s.button}>
          <svg width="13" height="9" viewBox="0 0 13 9" fill="none">
            <path
              d="M1.5 1.5L6.5 6.5L11.5 1.5"
              stroke="#0B0C0C"
              strokeWidth="2"
            />
          </svg>

          {expanded ? "Hide" : "Show"}
        </button>
      </header>
      {expanded && (
        <div className={s.inner}>
          <ul className={s.list}>
            {workflows?.map(workflow => (
              <KanbanCard workflow={workflow} key={workflow.id} />
            ))}
          </ul>

          <button className={s.loadMore}>Load more</button>
        </div>
      )}
    </section>
  )
}

export default KanbanColumn
