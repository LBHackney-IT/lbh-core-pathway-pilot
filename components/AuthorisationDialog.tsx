import Dialog from "./Dialog"
import { useRouter } from "next/router"
import { Form, Formik } from "formik"
import { authorisationSchema } from "../lib/validators"
import RadioField from "./FlexibleForms/RadioField"
import TextField from "./FlexibleForms/TextField"
import FormStatusMessage from "./FormStatusMessage"
import { Workflow, FinanceType } from "@prisma/client"

interface Props {
  workflow: Workflow
  isOpen: boolean
  onDismiss: (value: boolean) => void
}

enum Actions {
  SendToBrokerage = "sendToBrokerage",
  SendToDirectPayments = "sendToDirectPayments",
  ReturnForEdits = "return",
}

const AuthorisationDialog = ({
  workflow,
  isOpen,
  onDismiss,
}: Props): React.ReactElement => {
  const { push } = useRouter()

  const handleSubmit = async (values, { setStatus }) => {
    try {
      let body
      switch (values.action) {
        case Actions.SendToBrokerage:
          body = { sentTo: FinanceType.Brokerage }
          break
        case Actions.SendToDirectPayments:
          body = { sentTo: FinanceType.DirectPayments }
          break
        default:
          body = { reason: values.reason }
          break
      }

      const res = await fetch(`/api/workflows/${workflow.id}/approval`, {
        method: values.action === Actions.ReturnForEdits ? "DELETE" : "POST",
        body: JSON.stringify(body),
      })
      if (res.status !== 200) throw res.statusText
      onDismiss(false)
      push(`/workflows/${workflow.id}`)
    } catch (e) {
      setStatus(e.toString())
    }
  }

  return (
    <Dialog
      onDismiss={() => onDismiss(false)}
      isOpen={isOpen}
      title="Quality assurance meeting"
    >
      <Formik
        initialValues={{
          action: "",
          reason: "",
        }}
        onSubmit={handleSubmit}
        validationSchema={authorisationSchema}
      >
        {({ values, touched, errors }) => (
          <Form>
            <FormStatusMessage />

            <RadioField
              name="action"
              required
              touched={touched}
              errors={errors}
              label="Has this been authorised in a quality assurance meeting?"
              choices={[
                {
                  label: "Yes, send to brokerage",
                  value: Actions.SendToBrokerage,
                },
                {
                  label: "Yes, send to direct payments team",
                  value: Actions.SendToDirectPayments,
                },
                {
                  label: "No, return for edits",
                  value: Actions.ReturnForEdits,
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

export default AuthorisationDialog
