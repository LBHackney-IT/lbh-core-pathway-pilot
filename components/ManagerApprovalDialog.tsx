import Dialog from "./Dialog"
import { useRouter } from "next/router"
import { Form, Formik } from "formik"
import { managerApprovalSchema } from "../lib/validators"
import useUsers from "../hooks/useUsers"
import RadioField from "./FlexibleForms/RadioField"
import TextField from "./FlexibleForms/TextField"
import SelectField from "./FlexibleForms/SelectField"
import FormStatusMessage from "./FormStatusMessage"
import { Workflow } from "@prisma/client"

interface Props {
  workflow: Workflow
  isOpen: boolean
  onDismiss: (value: boolean) => void
}

const ManagerApprovalDialog = ({
  workflow,
  isOpen,
  onDismiss,
}: Props): React.ReactElement => {
  const { push } = useRouter()
  const { data: users } = useUsers()

  const panelApproverChoices = [{ label: "", value: "" }].concat(
    users
      ?.filter(user => user.panelApprover)
      ?.map(user => ({
        label: `${user.name} (${user.email})`,
        value: user.email,
      })) || []
  )

  const handleSubmit = async (values, { setStatus }) => {
    try {
      const res = await fetch(`/api/workflows/${workflow.id}/approval`, {
        method: values.action === "approve" ? "POST" : "DELETE",
        body: JSON.stringify(values),
      })
      if (res.status !== 200) throw res.statusText
      onDismiss(false)
      push(`/workflows/${workflow.id}`)
    } catch (e) {
      setStatus(e.toString())
    }
  }

  return (
    <Dialog onDismiss={() => onDismiss(false)} isOpen={isOpen} title="Approval">
      <Formik
        initialValues={{
          action: "",
          reason: "",
          panelApproverEmail: "",
        }}
        onSubmit={handleSubmit}
        validationSchema={managerApprovalSchema}
      >
        {({ values, touched, errors }) => (
          <Form>
            <FormStatusMessage />

            <RadioField
              name="action"
              required
              touched={touched}
              errors={errors}
              label="Do you want to approve this work?"
              choices={[
                {
                  label: "Yes, approve and send for quality assurance",
                  value: "approve",
                },
                {
                  label: "No, return for edits",
                  value: "return",
                },
              ]}
            />

            {values.action === "approve" && (
              <SelectField
                name="panelApproverEmail"
                label="Who should authorise this?"
                hint="They'll be notified by email"
                errors={errors}
                touched={touched}
                choices={panelApproverChoices}
                required
              />
            )}

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
              <button type="submit" className="govuk-button lbh-button">
                Submit
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </Dialog>
  )
}

export default ManagerApprovalDialog
