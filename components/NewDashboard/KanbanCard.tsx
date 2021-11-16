import s from "./KanbanCard.module.scss"
import Link from "next/link"
import {
  prettyDate,
  prettyResidentName,
  userInitials,
} from "../../lib/formatters"
import useResident from "../../hooks/useResident"
import { Status } from "../../types"
import { WorkflowForPlanner } from "../../pages/api/workflows"
import { WorkflowType } from ".prisma/client"
import { useSession } from "next-auth/client"
import { completeness } from "../../lib/taskList"
import CardCallToAction from "./CardCallToAction"

interface Props {
  workflow: WorkflowForPlanner
  status: Status
}

const KanbanCard = ({ workflow, status }: Props): React.ReactElement => {
  const { data: resident } = useResident(workflow.socialCareId)
  const [session] = useSession()

  const mine = session?.user?.email === workflow?.assignee?.email

  return (
    <li
      className={`${s.outer} ${
        status === Status.InProgress ? s.inProgress : ""
      } ${workflow.heldAt ? s.urgent : ""}`}
    >
      <Link href={`/workflows/${workflow.id}`}>
        <a className={s.link}>
          <h3 className={`lbh-heading-h5 govuk-!-margin-bottom-2 ${s.title}`}>
            {resident ? (
              prettyResidentName(resident)
            ) : (
              <span className={s.placeholder}>{workflow.socialCareId}</span>
            )}
          </h3>
        </a>
      </Link>

      <p className={`lbh-body-xs govuk-!-margin-bottom-1 ${s.meta}`}>
        {workflow.heldAt && `Urgent · `}
        {workflow.form && `${workflow.form.name} · `}
        {WorkflowType.Reassessment === workflow.type && `Reassessment · `}
        {workflow.type === "Historic" && `Historic · `}
        Started {prettyDate(String(workflow.createdAt))}
      </p>

      <footer className={s.footer}>
        <span>
          <CardCallToAction workflow={workflow} status={status} />
        </span>

        {workflow.assignee && (
          <div
            className={mine ? s.myCircle : s.assignmentCircle}
            title={`Assigned to ${workflow.assignee.name}${
              mine ? ` (you)` : ""
            }`}
          >
            {userInitials(workflow.assignee.name)}
          </div>
        )}
      </footer>
      {status === Status.InProgress && (
        <div
          className={s.completionBar}
          style={{ width: `${Math.floor(completeness(workflow) * 100)}%` }}
        ></div>
      )}
    </li>
  )
}

export default KanbanCard
