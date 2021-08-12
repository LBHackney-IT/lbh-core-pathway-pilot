import Link from "next/link"
import { useMemo } from "react"
import { displayEditorNames, prettyDateAndTime } from "../lib/formatters"
import { WorkflowWithCreatorAssigneeAndRevisions } from "../types"
import s from "./MilestoneTimeline.module.scss"

interface Props {
  workflow: WorkflowWithCreatorAssigneeAndRevisions
}

const MilestoneTimeline = ({ workflow }: Props): React.ReactElement => {
  const editorNames = useMemo(
    () => displayEditorNames(workflow.revisions),
    [workflow.revisions]
  )

  return (
    <ol className={`lbh-timeline ${s.rootedTimeline}`}>

      {/* reviewed as */}

      {workflow.discardedAt && (
        <li className={`lbh-timeline__event lbh-timeline__event--minor`}>
          <h3 className="lbh-body">Discarded by {workflow.discardedBy}</h3>
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
            Approved on behalf of panel by {workflow.panelApprover.name}
          </h3>
          <p className="lbh-body-xs">
            {prettyDateAndTime(String(workflow.panelApprovedAt))}
          </p>
        </li>
      )}

      {workflow.approvedAt && (
        <li className={`lbh-timeline__event ${s.approvalEvent}`}>
          <svg width="34" height="30" viewBox="0 0 34 30" fill="none">
            <path
              d="M3 16.4167L10.4286 24L31 3"
              stroke="white"
              strokeWidth="8"
            />
          </svg>
          <h3 className="lbh-body">
            Approved by {workflow.approver.name}
          </h3>
          <p className="lbh-body-xs">
            {prettyDateAndTime(String(workflow.approvedAt))}
          </p>
        </li>
      )}

{workflow.submittedAt && (
        <li className={`lbh-timeline__event lbh-timeline__event--minor`}>
          <h3 className="lbh-body">Submitted for approval by {workflow.submittedBy}</h3>
          <p className="lbh-body-xs govuk-!-margin-top-0">
            {prettyDateAndTime(String(workflow.submittedAt))}
          </p>
        </li>
      )}

      {editorNames && (
        <li className={`lbh-timeline__event lbh-timeline__event--minor`}>
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
        <h3 className="lbh-body">Started by {workflow.creator.name}</h3>
        <p className="lbh-body-xs govuk-!-margin-top-0">
          {prettyDateAndTime(String(workflow.createdAt))}
        </p>
      </li>

      {workflow.reviewOf && (
        <li className={`lbh-timeline__event`}>
          <h3 className="lbh-body">Review of <Link href={`/workflows/${workflow.reviewOf.id}`}>{workflow.reviewOf.formId}</Link></h3>
          <p className="lbh-body-xs govuk-!-margin-top-0">
          Last edited {prettyDateAndTime(String(workflow.reviewOf.updatedAt))}
        </p>
        </li>
      )}
    </ol>
  )
}

export default MilestoneTimeline
