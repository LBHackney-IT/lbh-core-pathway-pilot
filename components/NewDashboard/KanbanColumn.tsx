import { Prisma } from ".prisma/client"
import React, { useEffect, useState } from "react"
import { defaultPerPage as perPage } from "../../config"
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
  order?: Prisma.SortOrder
  children?: React.ReactChild
}

const KanbanColumn = ({
  status,
  queryParams,
  startOpen,
  order,
  children,
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
          order={order}
        >
          {children}
        </KanbanColumnInner>
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
  children,
  order,
}: InnerProps): React.ReactElement => {
  const { data, error, setSize, size } = useWorkflows({
    ...queryParams,
    order,
    status,
  })

  const count = data?.[0].count || 0
  const workflows = data?.reduce((acc, page) => {
    if (page.workflows) return acc.concat(page.workflows)
    return acc
  }, [])

  const isInitiallyLoading = !data && !error
  const isLoadingMore = data && data?.length < size
  const onLastPage = Math.ceil(count / perPage) <= size

  // keep count in column header up to date
  useEffect(() => {
    if (data) setCount(count.toString())
  }, [setCount, count, data])

  return (
    <div className={s.inner}>
      {children}

      <ul className={s.list}>
        {!isInitiallyLoading &&
          workflows?.map(workflow => (
            <KanbanCard workflow={workflow} status={status} key={workflow.id} />
          ))}

        {(isInitiallyLoading || isLoadingMore) && <Skeleton />}
      </ul>

      {!onLastPage && !isLoadingMore && (
        <button className={s.loadMore} onClick={() => setSize(size + 1)}>
          Load more
        </button>
      )}
    </div>
  )
}

export default KanbanColumn
