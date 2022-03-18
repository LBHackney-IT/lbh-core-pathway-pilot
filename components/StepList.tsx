import { Workflow, WorkflowType } from "@prisma/client"
import Link from "next/link"
import { Step } from "../types"
import s from "./StepList.module.scss"

interface Props {
  steps: Step[]
  workflow: Workflow
  completedSteps: string[]
}

const StepList = ({
  steps,
  workflow,
  completedSteps,
}: Props): React.ReactElement => (
  <ul className={s.items}>
    {steps.map(step => (
      <li className={s.item} key={step.id}>
        <span className={s.taskName}>
          <Link
            href={
              workflow.type === WorkflowType.Reassessment ||
              workflow.type === WorkflowType.Review
                ? `/reviews/${workflow.id}/steps/${step.id}`
                : `/workflows/${workflow.id}/steps/${step.id}`
            }
          >
            <a className="lbh-link">{step.name}</a>
          </Link>
        </span>

        {completedSteps.includes(step.id) ? (
          <strong
            className={`govuk-tag lbh-tag--green app-task-list__tag ${s.tagDone}`}
          >
            Done
          </strong>
        ) : (
          <strong
            className={`govuk-tag govuk-tag--grey app-task-list__tag ${s.tag}`}
          >
            To do
          </strong>
        )}
      </li>
    ))}
  </ul>
)

export default StepList
