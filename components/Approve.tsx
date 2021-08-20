import { useState } from "react"
import Dialog from "./Dialog"
import { useRouter } from "next/router"
import { Form, Formik } from "formik"
import { approvalSchema } from "../lib/validators"
import RadioField from "./FlexibleForms/RadioField"
import TextField from "./FlexibleForms/TextField"
import FormStatusMessage from "./FormStatusMessage"
import { Workflow } from "@prisma/client"
import { getStatus } from "../lib/status"
import { Status } from "../types"

interface Props {
  workflow: Workflow
}

const Approve = ({ workflow }: Props): React.ReactElement => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const { push } = useRouter()
  const status = getStatus(workflow)

  const handleSubmit = async (values, { setStatus }) => {
    try {
      const res = await fetch(`/api/workflows/${workflow.id}/approval`, {
        method: values.action === "approve" ? "POST" : "DELETE",
        body: JSON.stringify(values),
      })
      if (res.status !== 200) throw res.statusText
      setDialogOpen(false)
      push(`/workflows/${workflow.id}`)
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
        {status === Status.ManagerApproved ? "Approve for panel" : "Approve"}
      </button>

      <Dialog
        onDismiss={() => setDialogOpen(false)}
        isOpen={dialogOpen}
        title={
          status === Status.ManagerApproved ? "Panel approval" : "Approval"
        }
      >
        <Formik
          initialValues={{
            action: "",
            reason: "",
          }}
          onSubmit={handleSubmit}
          validationSchema={approvalSchema}
        >
          {({ values, touched, errors }) => (
            <Form>
              <FormStatusMessage />

              <RadioField
                name="action"
                required
                touched={touched}
                errors={errors}
                label={
                  status === Status.ManagerApproved
                    ? "Has the panel approved this work?"
                    : "Do you want to approve this work?"
                }
                choices={[
                  {
                    label:
                      status === Status.ManagerApproved
                        ? "Yes, the panel has approved this"
                        : "Yes, approve",
                    value: "approve",
                  },
                  {
                    label: "No, return for edits",
                    value: "return",
                  },
                ]}
              />

              {values.action === "return" && (
                <TextField
                  name="reason"
                  label="What needs to be changed?"
                  errors={errors}
                  touched={touched}
                  required={true}
                  as="textarea"
                />
              )}

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
