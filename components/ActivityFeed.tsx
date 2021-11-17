import useActivity from "../hooks/useActivity"
import useLocalStorage from "../hooks/useLocalStorage"
import { prettyDateToNow } from "../lib/formatters"
import Link from "next/link"
import s from "./ActivityFeed.module.scss"
import { useSession } from "next-auth/client"
import React, { useEffect, useRef, useState } from "react"
import formsForThisEnv from "../config/forms"
import { Form } from "../types"

const ActivityFeedInner = () => {
  const { data, size, setSize, error } = useActivity()
  const [forms, setForms] = useState<Form[]>([])

  const getForms = async () => setForms(await formsForThisEnv())

  useEffect(() => {
    getForms()
  }, [])

  const revisions = data?.reduce((acc, page) => {
    if (page) return acc.concat(page)
    return acc
  }, [])

  if (data)
    return (
      <div className={s.panel}>
        <ol className={s.list}>
          {revisions?.length > 0 &&
            revisions.map(revision => (
              <li className={s.revision} key={revision.id}>
                <p className="lbh-body-xs">
                  <strong>{revision?.actor?.name || revision.createdBy}</strong>{" "}
                  {revision?.action?.toLowerCase()} a{" "}
                  <Link href={`/workflows/${revision.workflowId}`}>
                    <a className={s.link}>
                      {forms?.find(
                        form => form.id === revision?.workflow?.formId
                      )?.name || "workflow"}
                    </a>
                  </Link>
                </p>

                <p className="lbh-body-xs govuk-!-margin-top-0 lmf-grey">
                  {prettyDateToNow(revision.createdAt.toString())}
                </p>
              </li>
            ))}
        </ol>

        <button className={s.loadMoreButton} onClick={() => setSize(size + 1)}>
          Load older
        </button>
      </div>
    )

  return null
}

const ActivityFeed = (): React.ReactElement | null => {
  const [expanded, setExpanded] = useLocalStorage("activity-feed-open", false)
  const [session] = useSession()
  const ref = useRef(null)

  useEffect(() => {
    const listener = event => {
      if (!ref.current || ref.current.contains(event.target)) return
      setExpanded(false)
    }

    document.addEventListener("mousedown", listener)
    document.addEventListener("touchstart", listener)

    return () => {
      document.removeEventListener("mousedown", listener)
      document.removeEventListener("touchstart", listener)
    }
  }, [ref])

  if (session)
    return (
      <aside aria-expanded={expanded} className={s.outer} ref={ref}>
        <button onClick={() => setExpanded(!expanded)} className={s.button}>
          {expanded ? (
            <>
              Close
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M11 1L1 11M11 1L1 11"
                  stroke="#0B0C0C"
                  stroke-width="2"
                />
                <path
                  d="M1 1L11 11M1 1L11 11"
                  stroke="#0B0C0C"
                  stroke-width="2"
                />
              </svg>
            </>
          ) : (
            <>
              Activity
              <svg width="20" height="13" viewBox="0 0 20 13" fill="none">
                <path d="M2 11L10 3L18 11" stroke="#0B0C0C" stroke-width="2" />
              </svg>
            </>
          )}
        </button>
        {expanded && <ActivityFeedInner />}
      </aside>
    )

  return null
}

export default ActivityFeed
