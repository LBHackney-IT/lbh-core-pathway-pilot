import { Prisma, WorkflowType } from "@prisma/client"
import Link from "next/link"
import { getStatus } from "../lib/status"
import { Status } from "../types"
import Approve from "./Approve"
import Restore from "./Restore"
import { useContext } from "react"
import { SessionContext } from "../lib/auth/SessionContext"
import {csrfFetch} from "../lib/csrfToken";
import {useRouter} from "next/router";

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
  const {push} = useRouter();

  const approver = session?.approver
  const panelApprover = session?.panelApprover
  const userIsInPilot = session?.inPilot

  const reassessment = workflow.nextWorkflows.find(
    w => w.type === WorkflowType.Reassessment
  )

  const handleStartReassessment = async () => {
    const res = await csrfFetch(`/api/workflows`, {
      method: "POST",
      body: JSON.stringify({
        formId: workflow.formId,
        socialCareId: workflow.socialCareId,
        workflowId: workflow.id,
        type: WorkflowType.Reassessment,
        answers: {
          Reassessment: {},
        },
      }),
    })

    const reassessment = await res.json()
    if (reassessment.error) throw reassessment.error
    if (reassessment.id) await push(`/workflows/${reassessment.id}/confirm-personal-details`)
  }

  if (reassessment)
    return (
      <Link href={`/workflows/${reassessment.id}`}>
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
      <a onClick={handleStartReassessment} className="govuk-button lbh-button">Start reassessment</a>
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
