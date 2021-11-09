import { prettyStatuses } from "../../config/statuses"
import useLocalStorage from "../../hooks/useLocalStorage"
import { Status } from "../../types"
import s from "./KanbanColumn.module.scss"

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
        <h2 className="lbh-heading-h4">
          {prettyStatuses[status]} <span className={s.count}>(20+)</span>
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
        <ul>
          <li>Cards</li>
          <li>go</li>
          <li>here</li>
        </ul>
      )}
    </section>
  )
}

export default KanbanColumn
