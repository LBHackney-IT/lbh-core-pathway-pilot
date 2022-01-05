import { Prisma } from "@prisma/client"
import Link from "next/link"
import { getStatus } from "../lib/status"
import { Status } from "../types"
import Approve from "./Approve"
import Restore from "./Restore"
import { useContext } from "react"
import { SessionContext } from "../lib/auth/SessionContext"

const workflowForPrimaryAction = Prisma.validator<Prisma.WorkflowArgs>()({
  include: {
    nextWorkflows: true,
    nextSteps: true,
  },
})
export type WorkflowForPrimaryAction = Prisma.WorkflowGetPayload<
  typeof workflowForPrimaryAction
>

interface Props {
  workflow: WorkflowForPrimaryAction
}

const PrimaryAction = ({ workflow }: Props): React.ReactElement | null => {
  const status = getStatus(workflow)
  const session = useContext(SessionContext)

  const approver = session?.approver
  const panelApprover = session?.panelApprover
  const userIsInPilot = session?.inPilot

  if (workflow.nextReview)
    return (
      <Link href={`/workflows/${workflow.nextReview.id}`}>
        <a className="govuk-button lbh-button govuk-button--secondary lbh-button--secondary">
          See next reassessment
        </a>
      </Link>
    )

  if (
    [Status.ReviewSoon, Status.Overdue, Status.NoAction].includes(status) &&
    userIsInPilot
  )
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

  if (status === Status.Submitted && approver && userIsInPilot)
    return <Approve workflow={workflow} />

  if (status === Status.ManagerApproved && panelApprover && userIsInPilot)
    return <Approve workflow={workflow} />

  if (status === Status.Discarded && approver && userIsInPilot)
    return <Restore workflowId={workflow.id} />

  return null
}

export default PrimaryAction
