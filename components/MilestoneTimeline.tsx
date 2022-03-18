import { Prisma, WorkflowType } from "@prisma/client"
import Link from "next/link"
import { useMemo } from "react"
import { prettyTeamNames } from "../config/teams"
import {
  displayEditorNames,
  prettyDate,
  prettyDateAndTime,
} from "../lib/formatters"
import { Form } from "../types"
import EpisodeDialog from "./EpisodeDialog"
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
    previousWorkflow: true,
    acknowledger: true,
    nextWorkflows: true,
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
  forms: Form[]
}

const MilestoneTimeline = ({ workflow, forms }: Props): React.ReactElement => {
  const editorNames = useMemo(
    () => displayEditorNames(workflow.revisions),
    [workflow.revisions]
  )

  const isReassessment = workflow.type === WorkflowType.Reassessment
  const reassessment = workflow.nextWorkflows.find(
    w => w.type === WorkflowType.Reassessment
  )
  const reviewWorkflow = workflow.nextWorkflows.find(
    w => w.type === WorkflowType.Review
  )

  return (
    <ol className={`lbh-timeline ${s.rootedTimeline}`}>
      {workflow.discardedAt && (
        <li className={`lbh-timeline__event lbh-timeline__event--minor`}>
          <h3 className="lbh-body">
            Discarded by {workflow?.discarder?.name || workflow.discardedBy}
          </h3>
          <p className="lbh-body-xs govuk-!-margin-top-0">
            {prettyDateAndTime(String(workflow.discardedAt))}
          </p>
        </li>
      )}

      {reviewWorkflow && (<li className={`lbh-timeline__event`}>
          <h3 className="lbh-body">Reviewed</h3>

          <p className="lbh-body-xs govuk-!-margin-top-0">
            {prettyDateAndTime(String(reviewWorkflow.createdAt))}
          </p>
        </li>)}
      {reassessment ? (
        <li className={`lbh-timeline__event`}>
          <h3 className="lbh-body">Reassessed</h3>

          <p className="lbh-body-xs govuk-!-margin-top-0">
            {prettyDateAndTime(String(reassessment.createdAt))}
          </p>
        </li>
      ) : (
        workflow.reviewBefore && (
          <li className={`lbh-timeline__event`}>
            <h3 className="lbh-body">Reassessment due</h3>
            <p className="lbh-body-xs govuk-!-margin-top-0">
              Reassess before {prettyDate(String(workflow.reviewBefore))}
            </p>
          </li>
        )
      )}

      {workflow.acknowledgedAt && (
        <li className={`lbh-timeline__event ${s.approvalEvent}`}>
          <svg width="34" height="30" viewBox="0 0 34 30" fill="none">
            <path
              d="M3 16.4167L10.4286 24L31 3"
              stroke="white"
              strokeWidth="8"
            />
          </svg>
          <h3 className="lbh-body">
            Acknowledged by{" "}
            {workflow?.acknowledger?.name || workflow.acknowledgedBy} for{" "}
            {prettyTeamNames[workflow.acknowledgingTeam].toLowerCase()} team
          </h3>
          <p className="lbh-body-xs">
            {prettyDateAndTime(String(workflow.acknowledgedAt))}
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
            {workflow.type === WorkflowType.Historic
              ? "Submitted to"
              : "Approved by"}{" "}
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

      <li className="lbh-timeline__event">
        <h3 className="lbh-body">
          Started by {workflow?.creator?.name || workflow.createdBy}
        </h3>
        {workflow.workflowId && (
          <p className="lbh-body-xs govuk-!-margin-top-0">
            Started from a{" "}
            <Link href={`/workflows/${workflow.previousWorkflow.id}`}>
              <a className="lbh-link lbh-link--no-visited-state">
                {isReassessment
                  ? "previous assessment"
                  : forms
                      .find(f => workflow.previousWorkflow.formId === f.id)
                      ?.name.toLowerCase() || workflow.previousWorkflow.formId}
              </a>
            </Link>
          </p>
        )}
        <EpisodeDialog workflow={workflow} forms={forms} />
        <p className="lbh-body-xs govuk-!-margin-top-0">
          {prettyDateAndTime(String(workflow.createdAt))}
        </p>
      </li>
    </ol>
  )
}

export default MilestoneTimeline
