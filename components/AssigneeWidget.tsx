import { Form, Formik } from "formik"
import { useState } from "react"
import { WorkflowWithCreatorAndAssignee } from "../types"
import Dialog from "./Dialog"
import SelectField from "../components/FlexibleForms/SelectField"
import useUsers from "../hooks/useUsers"
import PageAnnouncement from "./PageAnnouncement"
import useAssignee from "../hooks/useAssignee"
interface Props {
  workflow: WorkflowWithCreatorAndAssignee
}

const AssigneeWidget = ({ workflow }: Props): React.ReactElement => {
  const { data: users } = useUsers()
  const { data: assignee, mutate } = useAssignee(workflow.id)

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
      const res = await fetch(`/api/workflows/${workflow.id}`, {
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
    <section>
      <h2>Assigned to</h2>

      {assignee ? (
        <>
          {assignee.image && <img src={assignee.image} />}
          {assignee.name || assignee.email}
        </>
      ) : (
        <p>No one is assigned</p>
      )}

      <button onClick={() => setDialogOpen(true)}>Reassign</button>

      <Dialog
        onDismiss={() => setDialogOpen(false)}
        isOpen={dialogOpen}
        title="Reassign this workflow"
      >
        <Formik
          initialValues={{ assignedTo: assignee?.email || "" }}
          onSubmit={handleSubmit}
        >
          {({ status, isSubmitting }) => (
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
    </section>
  )
}

export default AssigneeWidget
