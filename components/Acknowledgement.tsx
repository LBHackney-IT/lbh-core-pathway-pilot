import Dialog from "./Dialog"
import { useRouter } from "next/router"
import { Form, Formik } from "formik"
import { acknowledgementSchema } from "../lib/validators"
import RadioField from "./FlexibleForms/RadioField"
import FormStatusMessage from "./FormStatusMessage"
import { csrfFetch } from "../lib/csrfToken"
import { useContext, useState } from "react"
import { prettyTeamNames } from "../config/teams"
import { SessionContext } from "../lib/auth/SessionContext";

interface Props {
  workflowId: string
}

const Acknowledgement = ({ workflowId }: Props): React.ReactElement => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const { push } = useRouter()

  const session = useContext(SessionContext);
  const userIsInPilot = session?.inPilot

  const handleSubmit = async (values, { setStatus }) => {
    try {
      const res = await csrfFetch(
        `/api/workflows/${workflowId}/acknowledgement`,
        {
          method: values.action === "return" ? "DELETE" : "POST",
          body: JSON.stringify(values),
        }
      )
      if (res.status !== 200) throw res.statusText
      setDialogOpen(false)
      push(`/workflows/${workflowId}`)
    } catch (e) {
      setStatus(e.toString())
    }
  }

  if (userIsInPilot)
    return (
      <>
        <button onClick={() => setDialogOpen(true)} className="lbh-link">
          Acknowledge
        </button>
        <Dialog
          onDismiss={() => setDialogOpen(false)}
          isOpen={dialogOpen}
          title="Acknowledge that care arrangements are being set up"
        >
          <Formik
            initialValues={{
              financeTeam: "",
            }}
            onSubmit={handleSubmit}
            validationSchema={acknowledgementSchema}
          >
            {({ touched, errors }) => (
              <Form>
                <FormStatusMessage />

                <RadioField
                  name="financeTeam"
                  required
                  touched={touched}
                  errors={errors}
                  label="Which team are you acknowledging on behalf of?"
                  choices={[
                    {
                      label: prettyTeamNames["Brokerage"],
                      value: "Brokerage",
                    },
                    {
                      label: prettyTeamNames["DirectPayments"],
                      value: "DirectPayments",
                    },
                  ]}
                />

                <div className="lbh-dialog__actions">
                  <button className="govuk-button lbh-button" type="submit">
                    Acknowledge
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </Dialog>
      </>
    )

  return null
}

export default Acknowledgement
