import { useState } from "react"
import { Prisma } from "@prisma/client"
import { getStatus } from "../lib/status"
import { Status } from "../types"
import AuthorisationDialog from "./AuthorisationDialog"
import ManagerApprovalDialog from "./ManagerApprovalDialog"

const workflowWithNextSteps = Prisma.validator<Prisma.WorkflowArgs>()({
  include: {
    nextSteps: true,
  },
})

type WorkflowWithNextSteps = Prisma.WorkflowGetPayload<
  typeof workflowWithNextSteps
>

interface Props {
  workflow: WorkflowWithNextSteps
}

const Approve = ({ workflow }: Props): React.ReactElement => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const status = getStatus(workflow)

  return (
    <>
      <button
        onClick={() => setDialogOpen(true)}
        className="govuk-button lbh-button"
      >
        Make a decision
      </button>

      {status === Status.ManagerApproved ? (
        <AuthorisationDialog
          workflow={workflow}
          isOpen={dialogOpen}
          onDismiss={() => setDialogOpen(false)}
        />
      ) : (
        <ManagerApprovalDialog
          workflow={workflow}
          isOpen={dialogOpen}
          onDismiss={() => setDialogOpen(false)}
        />
      )}
    </>
  )
}

export default Approve
