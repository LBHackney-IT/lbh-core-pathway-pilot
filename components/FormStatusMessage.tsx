import { useFormikContext } from "formik"
import PageAnnouncement from "./PageAnnouncement"

const FormStatusMessage = (): React.ReactElement => {
  const { status } = useFormikContext()

  if (status)
    return (
      <PageAnnouncement
        className="lbh-page-announcement--warning"
        title="There was a problem submitting your answers"
      >
        <p>Refresh the page or try again later.</p>
        <p className="lbh-body-xs">{status}</p>
      </PageAnnouncement>
    )

  return null
}

export default FormStatusMessage
