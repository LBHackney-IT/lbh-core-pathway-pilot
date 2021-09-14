import { useState } from "react"
import { Workflow } from "@prisma/client"
import { getStatus } from "../lib/status"
import { Status } from "../types"
import AuthorisationDialog from "./AuthorisationDialog"
import ManagerApprovalDialog from "./ManagerApprovalDialog"

interface Props {
  workflow: Workflow
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
        {status === Status.ManagerApproved ? "Authorise" : "Approve"}
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
