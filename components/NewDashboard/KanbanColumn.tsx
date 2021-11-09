import { prettyStatuses } from "../../config/statuses"
import useLocalStorage from "../../hooks/useLocalStorage"
import { Status } from "../../types"
import KanbanCard from "./KanbanCard"
import s from "./KanbanColumn.module.scss"
import Link from "next/link"

interface Props {
  status: Status
}

const KanbanColumn = ({ status }: Props): React.ReactElement => {
  const [expanded, setExpanded] = useLocalStorage(
    `${status}-column-expanded`,
    true
  )

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
        <ul className={s.list}>
          <KanbanCard />
          <KanbanCard />
          <KanbanCard />
        </ul>
      )}
    </section>
  )
}

export default KanbanColumn
