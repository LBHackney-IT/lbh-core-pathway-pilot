import { Prisma, Action } from "@prisma/client"
import Link from "next/link"
import React from "react"
import { prettyDateAndTime } from "../lib/formatters"
import { completeness } from "../lib/taskList"
import { Form } from "../types"
import s from "./RevisionList.module.scss"

const revisionWithRelations = Prisma.validator<Prisma.RevisionArgs>()({
  include: {
    actor: true,
  },
})
type RevisionWithRelations = Prisma.RevisionGetPayload<
  typeof revisionWithRelations
> & { form?: Form }

const workflowWithRelations = Prisma.validator<Prisma.WorkflowArgs>()({
  include: {
    updater: true,
    creator: true,
    revisions: {
      include: {
        actor: true,
      },
    },
  },
})
type WorkflowWithRelations = Prisma.WorkflowGetPayload<
  typeof workflowWithRelations
> & { form?: Form }

interface RevisionProps {
  r: RevisionWithRelations
  i: number
  totalRevisions: number
  selectedRevisionId?: string
  workflow: WorkflowWithRelations
}

const Revision = ({
  r,
  i,
  totalRevisions,
  selectedRevisionId,
  workflow,
}: RevisionProps): React.ReactElement => {
  if (r.action === Action.Reassigned)
    return (
      <div className={s.microRevision}>
        <span className="lbh-body-xs">
          Reassigned by {r.actor.name || r.actor.email}
        </span>
        <span className={s.metaSmall}>
          {prettyDateAndTime(String(r.createdAt))}
        </span>
      </div>
    )

  if (r.action === Action.ReturnedForEdits)
    return (
      <div className={s.microRevision}>
        <span className="lbh-body-xs">
          Returned for edits by {r.actor.name || r.actor.email}
        </span>
        <span className={s.metaSmall}>
          {prettyDateAndTime(String(r.createdAt))}
        </span>
      </div>
    )

  return (
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
          {workflow?.form
            ? `${Math.floor(completeness(workflow, r) * 100)}%`
            : "Unknown"}{" "}
          complete
          {i === totalRevisions - 1 && ` · Oldest version`}
        </span>
      </a>
    </Link>
  )
}

interface Props {
  workflow: WorkflowWithRelations
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
          <Revision
            r={r}
            key={r.id}
            totalRevisions={totalRevisions}
            selectedRevisionId={selectedRevisionId}
            i={i}
            workflow={workflow}
          />
        ))
      ) : (
        <p className={s.noResults}>No older revisions to show</p>
      )}
    </>
  )

  return
}

export default RevisionList
