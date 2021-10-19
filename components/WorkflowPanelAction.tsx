import { Prisma } from "@prisma/client"
import Link from "next/link"
import { getStatus } from "../lib/status"
import { useSession } from "../node_modules/next-auth/client"
import { Status } from "../types"

const workflowForPrimaryAction = Prisma.validator<Prisma.WorkflowArgs>()({
  include: {
    nextReview: true,
  },
})
export type WorkflowForPrimaryAction = Prisma.WorkflowGetPayload<
  typeof workflowForPrimaryAction
>

interface Props {
  workflow: WorkflowForPrimaryAction
}

const WorkflowPanelAction = ({
  workflow,
}: Props): React.ReactElement | null => {
  const status = getStatus(workflow)
  const [session] = useSession()
  const userIsInPilot = session?.user?.inPilot

  if (workflow.nextReview)
    return (
      <Link href={`/workflows/${workflow.nextReview.id}`}>
        <a className="govuk-button lbh-button govuk-button--secondary lbh-button--secondary">
          See next reassessment
        </a>
      </Link>
    )

  if (status === Status.NoAction && userIsInPilot)
    return (
      <Link href={`/workflows/${workflow.id}/confirm-personal-details`}>
        <a className="govuk-button lbh-button govuk-button--secondary lbh-button--secondary">
          Start reassessment
        </a>
      </Link>
    )

  if ([Status.ReviewSoon, Status.Overdue].includes(status) && userIsInPilot)
    return (
      <Link href={`/workflows/${workflow.id}/confirm-personal-details`}>
        <a className="govuk-button lbh-button">Start reassessment</a>
      </Link>
    )

  if (status === Status.InProgress && userIsInPilot)
    return (
      <Link href={`/workflows/${workflow.id}/steps`}>
        <a className="govuk-button lbh-button">Resume</a>
      </Link>
    )

  return (
    <Link href={`/workflows/${workflow.id}`}>
      <a className="govuk-button lbh-button">View</a>
    </Link>
  )
}

export default WorkflowPanelAction
