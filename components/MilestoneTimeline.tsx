import { Prisma } from "@prisma/client"
import Link from "next/link"
import { useMemo } from "react"
import { displayEditorNames, prettyDateAndTime } from "../lib/formatters"
import { Form } from "../types"
import s from "./MilestoneTimeline.module.scss"

const workflowForMilestoneTimeline = Prisma.validator<Prisma.WorkflowArgs>()({
  include: {
    creator: true,
    assignee: true,
    updater: true,
    managerApprover: true,
    panelApprover: true,
    discarder: true,
    submitter: true,
    previousReview: true,
    nextReview: true,
    revisions: {
      include: {
        actor: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    },
  },
})
export type WorkflowForMilestoneTimeline = Prisma.WorkflowGetPayload<
  typeof workflowForMilestoneTimeline
> & { form?: Form }

interface Props {
  workflow: WorkflowForMilestoneTimeline
}

const MilestoneTimeline = ({ workflow }: Props): React.ReactElement => {
  const editorNames = useMemo(
    () => displayEditorNames(workflow.revisions),
    [workflow.revisions]
  )

  return (
    <ol className={`lbh-timeline ${s.rootedTimeline}`}>
      {workflow.nextReview && (
        <li className={`lbh-timeline__event`}>
          <h3 className="lbh-body">Reassessed</h3>
          <p className="lbh-body-xs govuk-!-margin-top-0">
            <Link href={`/workflows/${workflow.nextReview.id}`}>
              <a className="lbh-link lbh-link--no-visited-state">
                See next reassessment
              </a>
            </Link>
          </p>
          <p className="lbh-body-xs govuk-!-margin-top-0">
            {prettyDateAndTime(String(workflow.nextReview.createdAt))}
          </p>
        </li>
      )}

      {workflow.discardedAt && (
        <li className={`lbh-timeline__event lbh-timeline__event--minor`}>
          <h3 className="lbh-body">
            Closed by {workflow?.discarder?.name || workflow.discardedBy}
          </h3>
          <p className="lbh-body-xs govuk-!-margin-top-0">
            {prettyDateAndTime(String(workflow.discardedAt))}
          </p>
        </li>
      )}

      {workflow.heldAt && (
        <li className={`lbh-timeline__event lbh-timeline__event--minor`}>
          <h3 className="lbh-body">Put on hold</h3>
          <p className="lbh-body-xs govuk-!-margin-top-0">
            {prettyDateAndTime(String(workflow.heldAt))}
          </p>
        </li>
      )}

      {workflow.panelApprovedAt && (
        <li className={`lbh-timeline__event ${s.approvalEvent}`}>
          <svg width="34" height="30" viewBox="0 0 34 30" fill="none">
            <path
              d="M3 16.4167L10.4286 24L31 3"
              stroke="white"
              strokeWidth="8"
            />
          </svg>
          <h3 className="lbh-body">
            Authorised by{" "}
            {workflow?.panelApprover?.name || workflow.panelApprovedBy}
          </h3>
          <p className="lbh-body-xs">
            {prettyDateAndTime(String(workflow.panelApprovedAt))}
          </p>
        </li>
      )}

      {workflow.managerApprovedAt && (
        <li className={`lbh-timeline__event ${s.approvalEvent}`}>
          <svg width="34" height="30" viewBox="0 0 34 30" fill="none">
            <path
              d="M3 16.4167L10.4286 24L31 3"
              stroke="white"
              strokeWidth="8"
            />
          </svg>
          <h3 className="lbh-body">
            Approved by{" "}
            {workflow?.managerApprover?.name || workflow.managerApprovedBy}
          </h3>
          <p className="lbh-body-xs">
            {prettyDateAndTime(String(workflow.managerApprovedAt))}
          </p>
        </li>
      )}

      {workflow.submittedAt && (
        <li className="lbh-timeline__event">
          <h3 className="lbh-body">
            Submitted for approval by{" "}
            {workflow?.submitter?.name || workflow.submittedBy}
          </h3>
          <p className="lbh-body-xs govuk-!-margin-top-0">
            {prettyDateAndTime(String(workflow.submittedAt))}
          </p>
        </li>
      )}

      {editorNames && (
        <li className="lbh-timeline__event lbh-timeline__event--minor">
          <h3 className="lbh-body">Edited by {editorNames}</h3>
          <p className="lbh-body-xs govuk-!-margin-top-0">
            <Link href={`/workflows/${workflow.id}/revisions`}>
              <a className="lbh-link lbh-link--no-visited-state">
                Compare revisions
              </a>
            </Link>
          </p>
        </li>
      )}

      {workflow.workflowId ? (
        <li className={`lbh-timeline__event`}>
          <h3 className="lbh-body">
            Reassessment started by{" "}
            {workflow?.creator?.name || workflow.createdBy}
          </h3>
          <p className="lbh-body-xs govuk-!-margin-top-0">
            <Link href={`/workflows/${workflow.previousReview.id}`}>
              <a className="lbh-link lbh-link--no-visited-state">
                See previous assessment
              </a>
            </Link>
          </p>
          <p className="lbh-body-xs govuk-!-margin-top-0">
            {prettyDateAndTime(String(workflow.createdAt))}
          </p>
        </li>
      ) : (
        <li className="lbh-timeline__event">
          <h3 className="lbh-body">
            Started by {workflow?.creator?.name || workflow.createdBy}
          </h3>
          <p className="lbh-body-xs govuk-!-margin-top-0">
            {prettyDateAndTime(String(workflow.createdAt))}
          </p>
        </li>
      )}
    </ol>
  )
}

export default MilestoneTimeline
