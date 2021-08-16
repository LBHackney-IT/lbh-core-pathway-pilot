import { Workflow } from "@prisma/client"
import Link from "next/link"
import { getStatus } from "../lib/status"
import { Status } from "../types"
import Approve from "./Approve"

interface Props {
  workflow: Workflow
}
const PrimaryAction = ({ workflow }: Props): React.ReactElement | null => {
  const status = getStatus(workflow)

  if (status === Status.Discarded)
    return (
      <button
        disabled
        className="govuk-button lbh-button govuk-button--secondary lbh-button--secondary"
      >
        Restore
      </button>
    )

  if (status === Status.InProgress)
    return (
      <Link href={`/workflows/${workflow.id}/steps`}>
        <a className="govuk-button lbh-button">Resume</a>
      </Link>
    )

  if ([Status.Submitted, Status.ManagerApproved].includes(status))
    return <Approve workflow={workflow} />

  return null
}

export default PrimaryAction
