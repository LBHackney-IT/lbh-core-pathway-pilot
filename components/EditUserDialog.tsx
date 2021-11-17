import { useState } from "react"
import { User } from "@prisma/client"
import { Form, Formik } from "formik"
import Dialog from "./Dialog"
import FormStatusMessage from "./FormStatusMessage"
import { csrfFetch } from "../lib/csrfToken"

interface Props {
  user: User
}

const EditUserDialog = ({ user }: Props): React.ReactElement => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)

  const handleSubmit = async (values, { setStatus }) => {
    try {
      const res = await csrfFetch(`/api/users/${user.id}`, {
        method: "PATCH",
        body: JSON.stringify(values),
      })
      if (res.status !== 200) throw res.statusText
      setDialogOpen(false)
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
        Edit role
      </button>

      <Dialog
        onDismiss={() => setDialogOpen(false)}
        isOpen={dialogOpen}
        title="Edit user"
      >
        <Formik
          initialValues={{}}
          onSubmit={handleSubmit}
          // validationSchema={authorisationSchema}
        >
          {() => (
            <Form>
              <FormStatusMessage />

              <div className="lbh-dialog__actions">
                <button className="govuk-button lbh-button" type="submit">
                  Submit
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </Dialog>
    </>
  )
}

export default EditUserDialog
