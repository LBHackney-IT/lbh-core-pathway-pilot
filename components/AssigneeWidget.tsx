import { Form, Formik } from "formik"
import { useState } from "react"
import { WorkflowWithCreatorAndAssignee } from "../types"
import Dialog from "./Dialog"
import SelectField from "../components/FlexibleForms/SelectField"
import useUsers from "../hooks/useUsers"

interface Props {
  workflow: WorkflowWithCreatorAndAssignee
}

const AssigneeWidget = ({ workflow }: Props): React.ReactElement => {
  const { data: users } = useUsers()
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)

  const choices = [{ label: "Unassigned", value: null }].concat(
    users?.map(user => ({
      label: `${user.name} (${user.email}`,
      value: user.email,
    }))
  )

  choices.concat()

  const handleSubmit = async (values, { setStatus }) => {
    try {
      const res = await fetch(`/api/workflows/${workflow.id}`, {
        method: "PATCH",
        body: JSON.stringify(values),
      })
      const data = await res.json()
      if (!data.id) throw data
    } catch (e) {
      setStatus(e.toString())
    }
  }

  return (
    <section>
      <h2>Assigned to</h2>

      {workflow.assignee ? (
        <>
          {workflow.assignee.image && <img src={workflow.assignee.image} />}
          {workflow.assignee.name || workflow.assignee.email}
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
          initialValues={{ assignedTo: workflow?.assignee?.email || "" }}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
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
                Done
              </button>
            </Form>
          )}
        </Formik>
      </Dialog>
    </section>
  )
}

export default AssigneeWidget
