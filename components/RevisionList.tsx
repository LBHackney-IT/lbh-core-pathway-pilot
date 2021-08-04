import Link from "next/link"
import { prettyDateAndTime } from "../lib/formatters"
import { WorkflowWithCreatorAssigneeAndRevisions } from "../types"
import s from "./RevisionList.module.scss"

interface Props {
  workflow: WorkflowWithCreatorAssigneeAndRevisions
  selectedRevisionId?: string
}

const RevisionList = ({
  workflow,
  selectedRevisionId,
}: Props): React.ReactElement => {
  return (
    <>
      <Link href={`/workflows/${workflow.id}/revisions`} scroll={false}>
        <a className={s.revisionButton} aria-selected={!selectedRevisionId}>
          <span className={s.actor}>{workflow.updatedBy}</span>
          <span className={s.meta}>
            {prettyDateAndTime(String(workflow.updatedAt))} · Latest version
          </span>
        </a>
      </Link>

      {workflow?.revisions?.length > 0 ? (
        workflow.revisions.map(r => (
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
                {prettyDateAndTime(String(r.createdAt))}
              </span>
            </a>
          </Link>
        ))
      ) : (
        <p>No older revisions to show</p>
      )}
    </>
  )

  return
}

export default RevisionList
