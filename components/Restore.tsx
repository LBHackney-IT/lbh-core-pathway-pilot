import { useRouter } from "next/router"
import { useState } from "react"
import Dialog from "./Dialog"
// import s from "./AssignmentWidget.module.scss"
import PageAnnouncement from "./PageAnnouncement"
import {csrfFetch} from "../lib/csrfToken";
// import { useRouter } from "next/router"

interface Props {
  workflowId: string
}

const Restore = ({ workflowId }: Props): React.ReactElement => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [status, setStatus] = useState<string | false>(false)
  const { push } = useRouter()

  const handleRestore = async () => {
    try {
      const res = await csrfFetch(`/api/workflows/${workflowId}`, {
        method: "PATCH",
        body: JSON.stringify({ discardedAt: null }),
      })
      if (res.status !== 200) throw res.statusText
      //   setDialogOpen(false)
      push(`/workflows/${workflowId}`)
    } catch (e) {
      setStatus(e.toString())
    }
  }

  return (
    <>
      <button
        onClick={() => setDialogOpen(true)}
        className="govuk-button lbh-button govuk-button--secondary lbh-button--secondary"
      >
        Restore
      </button>

      <Dialog
        onDismiss={() => setDialogOpen(false)}
        isOpen={dialogOpen}
        title="Are you sure you want to restore this workflow?"
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

        <div className="lbh-dialog__actions">
          <button className="govuk-button lbh-button" onClick={handleRestore}>
            Yes, restore
          </button>
          <button className="lbh-link" onClick={() => setDialogOpen(false)}>
            No, cancel
          </button>
        </div>
      </Dialog>
    </>
  )
}

export default Restore
