import useActivity from "../hooks/useActivity"
import useLocalStorage from "../hooks/useLocalStorage"
import { prettyDateToNow } from "../lib/formatters"
import Link from "next/link"
import s from "./ActivityFeed.module.scss"
import { useSession } from "next-auth/client"
import React from "react"

const ActivityFeedInner = () => {
  const { data, size, setSize, error } = useActivity()

  const revisions = data?.reduce((acc, page) => {
    if (page) return acc.concat(page)
    return acc
  }, [])

  return (
    <div className={s.panel}>
      <ol className={s.list}>
        {JSON.stringify(revisions)}
        {/* {revisions?.length > 0 &&
          revisions.map(revision => (
            <li className={s.revision} key={revision.id}>
              <p className="lbh-body-s">
                <strong>{revision?.actor?.name || revision.createdBy}</strong>{" "}
                {revision?.action?.toLowerCase()}
                <Link href={`/workflows/${revision.workflowId}`}>workflow</Link>
                {revision?.workflow?.socialCareId} -{revision?.workflow?.formId}{" "}
                -{" "}
              </p>
              <p className="lbh-body-xs">
                {prettyDateToNow(revision.createdAt.toString())}
              </p>
            </li>
          ))} */}
      </ol>
      <button onClick={() => setSize(size + 1)}>Load older activity</button>
    </div>
  )
}

const ActivityFeed = (): React.ReactElement | null => {
  const [expanded, setExpanded] = useLocalStorage("activity-feed-open", false)

  const [session] = useSession()

  if (session)
    return (
      <aside aria-expanded={expanded} className={s.outer}>
        <button onClick={() => setExpanded(!expanded)} className={s.button}>
          {expanded ? "Close" : "Activity"}
        </button>
        {expanded && <ActivityFeedInner />}
      </aside>
    )

  return null
}

export default ActivityFeed
