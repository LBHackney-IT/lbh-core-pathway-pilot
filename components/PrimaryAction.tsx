import { Workflow } from "@prisma/client"
import { useSession } from "next-auth/client"
import Link from "next/link"
import { getStatus } from "../lib/status"
import { Status } from "../types"
import Approve from "./Approve"

interface Props {
  workflow: Workflow
}
const PrimaryAction = ({ workflow }: Props): React.ReactElement | null => {
  const status = getStatus(workflow)
  const [session] = useSession()
  const approver = session?.user?.approver

  if (status === Status.NoAction)
    return (
      <Link href={`/reviews/new?id=${workflow.id}/`}>
        <a className="govuk-button lbh-button govuk-button--secondary lbh-button--secondary">
          Start review
        </a>
      </Link>
    )

  if (status === Status.ReviewSoon)
    return (
      <Link href={`/reviews/new?id=${workflow.id}/`}>
        <a className="govuk-button lbh-button">Start review</a>
      </Link>
    )

  if (status === Status.InProgress)
    return (
      <Link href={`/workflows/${workflow.id}/steps`}>
        <a className="govuk-button lbh-button">Resume</a>
      </Link>
    )

  // everything below here is approver-only actions
  if (!approver) return null

  if ([Status.Submitted, Status.ManagerApproved].includes(status))
    return <Approve workflow={workflow} />

  if (status === Status.Discarded)
    return (
      <button
        disabled
        className="govuk-button lbh-button govuk-button--secondary lbh-button--secondary"
      >
        Restore
      </button>
    )

  return null
}

export default PrimaryAction
