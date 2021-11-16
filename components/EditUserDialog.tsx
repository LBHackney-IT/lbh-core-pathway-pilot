import { useState } from "react"
import { User, Team } from "@prisma/client"
import { Field, Form, Formik } from "formik"
import Dialog from "./Dialog"
import FormStatusMessage from "./FormStatusMessage"
import { csrfFetch } from "../lib/csrfToken"
import s from "./EditUserDialog.module.scss"
import { prettyTeamNames } from "../config/teams"
import { userSchema } from "../lib/validators"
import { useRouter } from "next/router"

interface Props {
  user: User
}

const EditUserDialog = ({ user }: Props): React.ReactElement => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)

  const { reload } = useRouter()

  const handleSubmit = async (values, { setStatus }) => {
    try {
      const res = await csrfFetch(`/api/users/${user.id}`, {
        method: "PATCH",
        body: JSON.stringify(values),
      })
      if (res.status !== 200) throw res.statusText
      reload()
    } catch (e) {
      setStatus(e.toString())
    }
  }

  return (
    <>
      <button
        onClick={() => setDialogOpen(true)}
        className={s.editDetailsButton}
      >
        Edit role
      </button>

      <Dialog
        onDismiss={() => setDialogOpen(false)}
        isOpen={dialogOpen}
        title={`Editing ${user.name}`}
      >
        <Formik
          initialValues={{
            approver: user.approver,
            panelApprover: user.panelApprover,
            team: user.team,
          }}
          onSubmit={handleSubmit}
          validationSchema={userSchema}
        >
          {() => (
            <Form>
              <FormStatusMessage />

              <div className="govuk-form-group lbh-form-group govuk-checkboxes lbh-checkboxes">
                <div className="govuk-checkboxes__item">
                  <Field
                    className="govuk-checkboxes__input"
                    id="approver"
                    name="approver"
                    type="checkbox"
                  />
                  <label
                    className="govuk-label govuk-checkboxes__label"
                    htmlFor="approver"
                  >
                    Approver
                  </label>
                </div>

                <div className="govuk-checkboxes__item">
                  <Field
                    className="govuk-checkboxes__input"
                    id="panelApprover"
                    name="panelApprover"
                    type="checkbox"
                  />
                  <label
                    className="govuk-label govuk-checkboxes__label"
                    htmlFor="panelApprover"
                  >
                    QAM approver
                  </label>
                </div>
              </div>

              <div className="govuk-form-group lbh-form-group">
                <label className="govuk-label lbh-label" htmlFor="team">
                  Team
                </label>
                <Field
                  as="select"
                  name="team"
                  className="govuk-select lbh-select"
                >
                  <option value="">No team</option>
                  {Object.entries(Team).map(([key, val]) => (
                    <option key={val} value={val}>
                      {prettyTeamNames[key]}
                    </option>
                  ))}
                </Field>
              </div>

              <div className="lbh-dialog__actions">
                <button className="govuk-button lbh-button" type="submit">
                  Save changes
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
