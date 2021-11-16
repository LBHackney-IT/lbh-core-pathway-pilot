import useActivity from "../hooks/useActivity"
import useLocalStorage from "../hooks/useLocalStorage"
import { prettyDateToNow } from "../lib/formatters"
import Link from "next/link"

const ActivityFeedInner = () => {
  const { data, size, setSize, error } = useActivity()

  const revisions = data?.reduce((acc, page) => {
    if (page) return acc.concat(page)
    return acc
  }, [])

  return (
    <div>
      <ol>
        {revisions &&
          revisions?.map(revision => (
            <li>
              <p className="lbh-body-s">
                <strong>{revision.actor.name}</strong>{" "}
                {revision.action.toLowerCase()} a{" "}
                <Link href={`/workflows/${revision.workflowId}`}>workflow</Link>
                {revision?.workflow?.socialCareId} -{revision?.workflow?.formId}{" "}
                -{" "}
              </p>
              <p className="lbh-body-xs">
                {prettyDateToNow(revision.createdAt.toString())}
              </p>
            </li>
          ))}
      </ol>
      <button onClick={() => setSize(size + 1)}>Load older activity</button>
    </div>
  )
}

const ActivityFeed = () => {
  const [expanded, setExpanded] = useLocalStorage("activity-feed-open", false)

  return (
    <aside aria-expanded={expanded}>
      <button onClick={() => setExpanded(!expanded)}>Activity feed</button>
      {expanded && <ActivityFeedInner />}
    </aside>
  )
}

export default ActivityFeed
