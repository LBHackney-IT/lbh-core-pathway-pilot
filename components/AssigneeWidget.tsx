import { Form, Formik } from "formik"
import { useState } from "react"
import Dialog from "./Dialog"
import SelectField from "../components/FlexibleForms/SelectField"
import useUsers from "../hooks/useUsers"
import PageAnnouncement from "./PageAnnouncement"
import useAssignee from "../hooks/useAssignment"
import s from "./AssigneeWidget.module.scss"
import { useSession } from "next-auth/client"
import teams from "../config/teams"

interface Props {
  workflowId: string
}

const AssigneeWidget = ({ workflowId }: Props): React.ReactElement => {
  const { data: users } = useUsers()
  const { data: assignment, mutate } = useAssignee(workflowId)
  const [session] = useSession()

  const [dialogOpen, setDialogOpen] = useState<boolean>(false)

  const choices = [{ label: "Unassigned", value: "" }].concat(
    users?.map(user => ({
      label: `${user.name} (${user.email})`,
      value: user.email,
    }))
  )

  const teamChoices = [{ label: "Unassigned", value: "" }].concat(
    teams.map(team => ({ label: team, value: team }))
  )

  const handleSubmit = async (values, { setStatus }) => {
    try {
      const res = await fetch(`/api/workflows/${workflowId}`, {
        method: "PATCH",
        body: JSON.stringify({
          assignedTo: values.assignedTo || null,
          assignedTeam: values.assignedTeam || null,
        }),
      })
      const data = await res.json()
      if (data.error) throw data.error
      mutate()
      setDialogOpen(false)
    } catch (e) {
      setStatus(e.toString())
    }
  }

  return (
    <>
      {assignment?.assignee ? (
        <p className={`lbh-body-s ${s.assignee}`}>
          Assigned to{" "}
          {assignment?.assignee?.name || assignment?.assignee?.email} ·{" "}
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
          initialValues={{
            assignedTo: assignment?.assignee?.email || "",
            assignedTeam: assignment?.assignedTeam || "",
          }}
          onSubmit={handleSubmit}
        >
          {({ submitForm, setFieldValue, status, isSubmitting, values }) => (
            <Form>
              {JSON.stringify(values)}
              {status && (
                <PageAnnouncement
                  className="lbh-page-announcement--warning"
                  title="There was a problem submitting your answers"
                >
                  <p>Refresh the page or try again later.</p>
                  <p className="lbh-body-xs">{status}</p>
                </PageAnnouncement>
              )}

              {assignment?.assignee?.email !== session?.user?.email && (
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

              {users?.length > 0 && (
                <SelectField
                  name="assignedTeam"
                  label="Team"
                  touched={null}
                  errors={null}
                  choices={teamChoices}
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
