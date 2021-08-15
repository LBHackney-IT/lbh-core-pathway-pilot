import { useState } from "react"
import Dialog from "./Dialog"
import PageAnnouncement from "./PageAnnouncement"
import { useRouter } from "next/router"
import { Form, Formik } from "formik"
import { approvalSchema } from "../lib/validators"
import RadioField from "./FlexibleForms/RadioField"
import TextField from "./FlexibleForms/TextField"

interface Props {
  workflowId: string
}

const Approve = ({ workflowId }: Props): React.ReactElement => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const { push } = useRouter()

  const handleSubmit = async (values, { setStatus }) => {
    try {
      const res = await fetch(`/api/workflows/${workflowId}/approval`, {
        method: values.action === "approve" ? "POST" : "DELETE",
        body: JSON.stringify(values),
      })
      if (res.status !== 200) throw res.statusText
      setDialogOpen(false)
      push(`/workflows/${workflowId}`)
    } catch (e) {
      setStatus(e.toString())
    }
  }

  return (
    <>
      <button
        onClick={() => setDialogOpen(true)}
        className="govuk-button lbh-button"
      >
        Approve
      </button>

      <Dialog
        onDismiss={() => setDialogOpen(false)}
        isOpen={dialogOpen}
        title="Approval"
      >
        <Formik
          initialValues={{
            action: "",
            reason: "",
          }}
          onSubmit={handleSubmit}
          validationSchema={approvalSchema}
        >
          {({ values, status, touched, errors }) => (
            <Form>
              {JSON.stringify(values)}
              {status && (
                <PageAnnouncement
                  className="lbh-page-announcement--warning"
                  title="There was a problem submitting your answers"
                >
                  <p>Refresh the page or try again later.</p>
                  <p className="lbh-body-xs">{status}</p>
                </PageAnnouncement>
              )}

              <RadioField
                name="action"
                required
                touched={touched}
                errors={errors}
                label="Do you want to approve this work?"
                choices={[
                  {
                    label: "Yes, approve",
                    value: "approve",
                  },
                  {
                    label: "No, return for edits",
                    value: "return",
                  },
                ]}
              />

              <TextField
                name="reason"
                label="What needs to be changed?"
                errors={errors}
                touched={touched}
                required={values.action === "return"}
                as="textarea"
              />

              <div className="lbh-dialog__actions">
                <button className="govuk-button lbh-button">Submit</button>
              </div>
            </Form>
          )}
        </Formik>
      </Dialog>
    </>
  )
}

export default Approve
