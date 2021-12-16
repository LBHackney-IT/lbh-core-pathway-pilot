import {useContext, useState} from "react"
import Dialog from "./Dialog"
import PageAnnouncement from "./PageAnnouncement"
import { useRouter } from "next/router"
import { csrfFetch } from "../lib/csrfToken"
import {SessionContext} from "../lib/auth/SessionContext";

interface Props {
  workflowId: string
  held?: boolean
}

const Urgent = ({ workflowId, held }: Props): React.ReactElement => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [status, setStatus] = useState<string | false>(false)
  const { reload } = useRouter()
  const session = useContext(SessionContext)

  const handleHold = async () => {
    try {
      const res = await csrfFetch(`/api/workflows/${workflowId}`, {
        method: "PATCH",
        body: JSON.stringify({
          heldAt: new Date(),
        }),
      })
      if (res.status !== 200) throw res.statusText
      setDialogOpen(false)
      reload()
    } catch (e) {
      setStatus(e.toString())
    }
  }

  const handleUnhold = async () => {
    try {
      const res = await csrfFetch(`/api/workflows/${workflowId}`, {
        method: "PATCH",
        body: JSON.stringify({
          heldAt: null,
        }),
      })
      if (res.status !== 200) throw res.statusText
      setDialogOpen(false)
      reload()
    } catch (e) {
      setStatus(e.toString())
    }
  }

  const userIsInPilot = session?.inPilot

  if (!userIsInPilot) return null

  return (
    <>
      <button onClick={() => setDialogOpen(true)} className="lbh-link">
        {held ? "Remove urgent" : "Mark urgent"}
      </button>

      <Dialog
        onDismiss={() => setDialogOpen(false)}
        isOpen={dialogOpen}
        title={
          held
            ? "Are you sure this workflow is no longer urgent?"
            : "Are you sure you want to mark this workflow as urgent?"
        }
      >
        {status && (
          <PageAnnouncement
            className="lbh-page-announcement--warning"
            title="There was a problem submitting your answers"
          >
            <p>Refresh the page or try again later.</p>
            <p className="lbh-body-xs">{status}</p>
          </PageAnnouncement>
        )}

        {!held && <p>Urgent workflows appear at the top of the planner.</p>}

        <div className="lbh-dialog__actions">
          {held ? (
            <button className="govuk-button lbh-button" onClick={handleUnhold}>
              Yes, remove
            </button>
          ) : (
            <button className="govuk-button lbh-button" onClick={handleHold}>
              Yes, mark as urgent
            </button>
          )}

          <button className="lbh-link" onClick={() => setDialogOpen(false)}>
            No, cancel
          </button>
        </div>
      </Dialog>
    </>
  )
}

export default Urgent
