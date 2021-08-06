import { useState } from "react"
import Dialog from "./Dialog"
// import s from "./AssignmentWidget.module.scss"
import PageAnnouncement from "./PageAnnouncement"
import { useRouter } from "next/router"

interface Props {
  workflowId: string
}

const Discard = ({ workflowId }: Props): React.ReactElement => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [status, setStatus] = useState<string | false>(false)
  const { push } = useRouter()

  const handleDiscard = async () => {
    try {
      const res = await fetch(`/api/workflows/${workflowId}`, {
        method: "DELETE",
      })
      if (res.status !== 204) throw res.statusText
      setDialogOpen(false)
      push("/")
    } catch (e) {
      setStatus(e.toString())
    }
  }

  return (
    <>
      <button onClick={() => setDialogOpen(true)} className="lbh-link">
        Discard
      </button>

      <Dialog
        onDismiss={() => setDialogOpen(false)}
        isOpen={dialogOpen}
        title="Are you sure you want to discard this workflow?"
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
        <p>It will no longer be visible to you or your colleagues.</p>
        <div className="lbh-dialog__actions">
          <button className="govuk-button lbh-button" onClick={handleDiscard}>
            Yes, discard
          </button>
          <button className="lbh-link" onClick={() => setDialogOpen(false)}>
            No, cancel
          </button>
        </div>
      </Dialog>
    </>
  )
}

export default Discard
