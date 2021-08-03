import { prettyDateAndTime } from "../lib/formatters"
import { WorkflowWithCreatorAssigneeAndRevisions } from "../types"

interface Props {
  workflow: WorkflowWithCreatorAssigneeAndRevisions
}

const MilestoneTimeline = ({ workflow }: Props): React.ReactElement => (
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

    <li className="lbh-timeline__event">
      <h3 className="lbh-body">Started by {workflow.creator.name}</h3>
      <p className="lbh-body-xs">
        {prettyDateAndTime(String(workflow.createdAt))}
      </p>
    </li>

    {/* review of */}
  </ol>
)

export default MilestoneTimeline
