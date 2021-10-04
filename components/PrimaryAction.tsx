import { Prisma } from "@prisma/client"
import { useSession } from "next-auth/client"
import Link from "next/link"
import { getStatus } from "../lib/status"
import { Status } from "../types"
import Approve from "./Approve"
import Restore from "./Restore"

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

const PrimaryAction = ({ workflow }: Props): React.ReactElement | null => {
  const status = getStatus(workflow)
  const [session] = useSession()

  const approver = session?.user?.approver
  const panelApprover = session?.user?.panelApprover

  if (workflow.nextReview)
    return (
      <Link href={`/workflows/${workflow.nextReview.id}`}>
        <a className="govuk-button lbh-button govuk-button--secondary lbh-button--secondary">
          See next reassessment
        </a>
      </Link>
    )

  if (status === Status.NoAction)
    return (
      <Link href={`/workflows/${workflow.id}/confirm-personal-details`}>
        <a className="govuk-button lbh-button govuk-button--secondary lbh-button--secondary">
          Start reassessment
        </a>
      </Link>
    )

  if ([Status.ReviewSoon, Status.Overdue].includes(status))
    return (
      <Link href={`/workflows/${workflow.id}/confirm-personal-details`}>
        <a className="govuk-button lbh-button">Start reassessment</a>
      </Link>
    )

  if (status === Status.InProgress)
    return (
      <Link href={`/workflows/${workflow.id}/steps`}>
        <a className="govuk-button lbh-button">Resume</a>
      </Link>
    )

  if (status === Status.Submitted && approver)
    return <Approve workflow={workflow} />

  if (status === Status.ManagerApproved && panelApprover)
    return <Approve workflow={workflow} />

  if (status === Status.Discarded && approver)
    return <Restore workflowId={workflow.id} />

  return null
}

export default PrimaryAction
