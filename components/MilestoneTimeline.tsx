import Link from "next/link"
import { useMemo } from "react"
import { displayEditorNames, prettyDateAndTime } from "../lib/formatters"
import { WorkflowWithCreatorAssigneeAndRevisions } from "../types"

interface Props {
  workflow: WorkflowWithCreatorAssigneeAndRevisions
}

const MilestoneTimeline = ({ workflow }: Props): React.ReactElement => {
  const editorNames = useMemo(
    () => displayEditorNames(workflow.revisions),
    [workflow.revisions]
  )

  return (
    <ol className="lbh-timeline">
      {/* reviewed as */}

      {/* discarded at */}

      {/* {submission.panelApprovedAt && (
        <li className={`lbh-timeline__event ${s.approvalEvent}`}>
          <svg width="34" height="30" viewBox="0 0 34 30" fill="none">
            <path
              d="M3 16.4167L10.4286 24L31 3"
              stroke="white"
              strokeWidth="8"
            />
          </svg>
          <h3 className="lbh-body">
            Approved on behalf of panel by {submission.panelApprovedBy?.email}
          </h3>
          <p className="lbh-body-xs">
            {format(
              new Date(submission.panelApprovedAt),
              "d MMM yyyy K.mm aaa"
            )}
          </p>
        </li>
      )} */}

      {/* {submission?.approvedAt && (
        <li className={`lbh-timeline__event ${s.approvalEvent}`}>
          <svg width="34" height="30" viewBox="0 0 34 30" fill="none">
            <path
              d="M3 16.4167L10.4286 24L31 3"
              stroke="white"
              strokeWidth="8"
            />
          </svg>
          <h3 className="lbh-body">
            Approved by {workflow.approver}
          </h3>
          <p className="lbh-body-xs">
            {prettyDate(String(workflow.approvedAt))}
          </p>
        </li>
      )} */}

      {workflow.heldAt && (
        <li className={`lbh-timeline__event lbh-timeline__event--minor`}>
          <h3 className="lbh-body">Put on hold</h3>
          <p className="lbh-body-xs govuk-!-margin-top-0">
            {prettyDateAndTime(String(workflow.heldAt))}
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

      {/* review of */}
    </ol>
  )
}

export default MilestoneTimeline
