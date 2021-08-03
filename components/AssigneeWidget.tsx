import { Form, Formik } from "formik"
import { useState } from "react"
import Dialog from "./Dialog"
import SelectField from "../components/FlexibleForms/SelectField"
import useUsers from "../hooks/useUsers"
import PageAnnouncement from "./PageAnnouncement"
import useAssignee from "../hooks/useAssignee"
import s from "./AssigneeWidget.module.scss"
import { useSession } from "next-auth/client"

interface Props {
  workflowId: string
}

const AssigneeWidget = ({ workflowId }: Props): React.ReactElement => {
  const { data: users } = useUsers()
  const { data: assignee, mutate } = useAssignee(workflowId)
  const [session, loading] = useSession()

  const [dialogOpen, setDialogOpen] = useState<boolean>(false)

  const choices = [{ label: "Unassigned", value: "" }].concat(
    users?.map(user => ({
      label: `${user.name} (${user.email})`,
      value: user.email,
    }))
  )

  const handleSubmit = async (values, { setStatus }) => {
    try {
      const newAssignee = values.assignedTo || null
      const res = await fetch(`/api/workflows/${workflowId}`, {
        method: "PATCH",
        body: JSON.stringify({
          assignedTo: newAssignee,
        }),
      })
      const data = await res.json()
      if (data.error) throw data.error
      mutate(newAssignee)
      setDialogOpen(false)
    } catch (e) {
      setStatus(e.toString())
    }
  }

  return (
    <>
      {assignee ? (
        <p className={`lbh-body-s ${s.assignee}`}>
          Assigned to {assignee?.name || assignee?.email} ·{" "}
          <button onClick={() => setDialogOpen(true)}>Reassign</button>
        </p>
      ) : (
        <p className={`lbh-body-s ${s.assignee}`}>
          No one is assigned ·{" "}
          <button onClick={() => setDialogOpen(true)}>Assign someone?</button>
        </p>
      )}

      <Dialog
        onDismiss={() => setDialogOpen(false)}
        isOpen={dialogOpen}
        title="Reassign this workflow"
      >
        <Formik
          initialValues={{ assignedTo: assignee?.email || "" }}
          onSubmit={handleSubmit}
        >
          {({ submitForm, setFieldValue, status, isSubmitting }) => (
            <Form>
              {status && (
                <PageAnnouncement
                  className="lbh-page-announcement--warning"
                  title="There was a problem submitting your answers"
                >
                  <p>Refresh the page or try again later.</p>
                  <p className="lbh-body-xs">{status}</p>
                </PageAnnouncement>
              )}

              {assignee?.email !== session?.user?.email && (
                <button
                  className="lbh-link"
                  onClick={() => {
                    setFieldValue("assignedTo", session.user.email)
                    submitForm()
                  }}
                >
                  Assign to me
                </button>
              )}

              {users?.length > 0 && (
                <SelectField
                  name="assignedTo"
                  label="Assign to"
                  touched={null}
                  errors={null}
                  choices={choices}
                />
              )}

              <button
                className="govuk-button lbh-button"
                disabled={isSubmitting}
              >
                Save changes
              </button>
            </Form>
          )}
        </Formik>
      </Dialog>
    </>
  )
}

export default AssigneeWidget
