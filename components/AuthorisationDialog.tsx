import Dialog from "./Dialog"
import { useRouter } from "next/router"
import { Form, Formik } from "formik"
import { authorisationSchema } from "../lib/validators"
import RadioField from "./FlexibleForms/RadioField"
import TextField from "./FlexibleForms/TextField"
import FormStatusMessage from "./FormStatusMessage"
import { Workflow } from "@prisma/client"
import { csrfFetch } from "../lib/csrfToken"
import Link from "next/link"

interface Props {
  workflow: Workflow
  isOpen: boolean
  onDismiss: (value: boolean) => void
}

const AuthorisationDialog = ({
  workflow,
  isOpen,
  onDismiss,
}: Props): React.ReactElement => {
  const { push } = useRouter()

  const handleSubmit = async (values, { setStatus }) => {
    try {
      const res = await csrfFetch(`/api/workflows/${workflow.id}/approval`, {
        method: values.action === "return" ? "DELETE" : "POST",
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
    <Dialog
      onDismiss={() => onDismiss(false)}
      isOpen={isOpen}
      title="Quality assurance meeting"
    >
      <Formik
        initialValues={{
          action: "",
          comment: "",
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
                  label: "Yes, it has been authorised",
                  value: "authorise",
                },
                {
                  label: "No, return for edits",
                  value: "return",
                },
              ]}
            />

            {values.action === "return" && (
              <TextField
                name="comment"
                label="What needs to be changed?"
                errors={errors}
                touched={touched}
                required={true}
                as="textarea"
              />
            )}

            <div className="lbh-dialog__actions">
              <button className="govuk-button lbh-button" type="submit">
                Submit
              </button>
            </div>

            <p className="lbh-body-s">
              You can{" "}
              <Link href={`/workflows/${workflow.id}/steps`}>
                make minor edits
              </Link>{" "}
              yourself.
            </p>
          </Form>
        )}
      </Formik>
    </Dialog>
  )
}

export default AuthorisationDialog
