import React, { useEffect, useState } from "react"
import { prettyStatuses } from "../../config/statuses"
import useLocalStorage from "../../hooks/useLocalStorage"
import useWorkflows, { WorkflowQueryParams } from "../../hooks/useWorkflows"
import { Status } from "../../types"
import KanbanCard from "./KanbanCard"
import Skeleton from "./KanbanCardSkeleton"
import s from "./KanbanColumn.module.scss"

interface Props {
  status: Status
  queryParams: WorkflowQueryParams
  startOpen?: boolean
}

const KanbanColumn = ({
  status,
  queryParams,
  startOpen,
}: Props): React.ReactElement => {
  const [expanded, setExpanded] = useLocalStorage<boolean>(
    `${status}-column-expanded`,
    startOpen || true
  )

  const [count, setCount] = useState<string>("")

  return (
    <section aria-expanded={expanded} className={s.outer}>
      <header className={s.header}>
        <h2 className="lbh-heading-h5">
          {prettyStatuses[status]}{" "}
          {count && <span className={s.count}>({count})</span>}
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
        <KanbanColumnInner
          status={status}
          queryParams={queryParams}
          setCount={setCount}
        />
      )}
    </section>
  )
}

interface InnerProps extends Props {
  setCount: (count: string) => void
}

const KanbanColumnInner = ({
  status,
  queryParams,
  setCount,
}: InnerProps): React.ReactElement => {
  const { data, error } = useWorkflows({
    ...queryParams,
    status,
  })

  // keep count up to date
  useEffect(() => setCount(data?.count?.toString()), [data?.count, setCount])

  return (
    <div className={s.inner}>
      <ul className={s.list}>
        {data
          ? data?.workflows?.map(workflow => (
              <KanbanCard
                workflow={workflow}
                status={status}
                key={workflow.id}
              />
            ))
          : !error && <Skeleton />}
      </ul>

      {data?.count > data?.workflows?.length && (
        <button className={s.loadMore}>Load more</button>
      )}
    </div>
  )
}

export default KanbanColumn
