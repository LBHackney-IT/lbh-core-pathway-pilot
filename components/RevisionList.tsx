import Link from "next/link"
import { prettyDateAndTime } from "../lib/formatters"
import { completeness } from "../lib/taskList"
import { WorkflowWithExtras } from "../types"
import s from "./RevisionList.module.scss"

interface Props {
  workflow: WorkflowWithExtras
  selectedRevisionId?: string
}

const RevisionList = ({
  workflow,
  selectedRevisionId,
}: Props): React.ReactElement => {
  const totalRevisions = workflow?.revisions?.length

  return (
    <>
      <Link href={`/workflows/${workflow.id}/revisions`} scroll={false}>
        <a className={s.revisionButton} aria-selected={!selectedRevisionId}>
          <span className={s.actor}>
            {workflow?.updater?.name || "Unknown user"}
          </span>
          <span className={s.meta}>
            {prettyDateAndTime(String(workflow.updatedAt))} · Current version
          </span>
        </a>
      </Link>

      {totalRevisions > 0 ? (
        workflow.revisions.map((r, i) => (
          <Link
            scroll={false}
            key={r.id}
            href={`/workflows/${workflow.id}/revisions/${r.id}`}
          >
            <a
              className={s.revisionButton}
              aria-selected={r.id === selectedRevisionId}
            >
              <span className={s.actor}>{r.actor.name}</span>
              <span className={s.meta}>
                {prettyDateAndTime(String(r.createdAt))} ·{" "}
                {Math.floor(completeness(workflow, r) * 100)}% complete
                {i === totalRevisions - 1 && ` · Oldest version`}
              </span>
            </a>
          </Link>
        ))
      ) : (
        <p className={s.noResults}>No older revisions to show</p>
      )}
    </>
  )

  return
}

export default RevisionList
