import { Form, Formik } from "formik"
import { useState } from "react"
import Dialog from "./Dialog"
import SelectField from "./FlexibleForms/SelectField"
import useUsers from "../hooks/useUsers"
import useAssignment from "../hooks/useAssignment"
import s from "./AssignmentWidget.module.scss"
import { useSession } from "next-auth/client"
import FormStatusMessage from "./FormStatusMessage"
import { Team } from "@prisma/client"
import { prettyTeamNames } from "../config/teams"

interface Props {
  workflowId: string
}

const AssignmentWidget = ({ workflowId }: Props): React.ReactElement => {
  const { data: users } = useUsers()
  const { data: assignment, mutate } = useAssignment(workflowId)
  const [session] = useSession()

  const [dialogOpen, setDialogOpen] = useState<boolean>(false)

  const choices = [{ label: "Unassigned", value: "" }].concat(
    users?.map(user => ({
      label: `${user.name} (${user.email})`,
      value: user.email,
    }))
  )

  const teamChoices = [{ label: "Unassigned", value: "" }].concat(
    Object.keys(Team).map(team => ({
      label: prettyTeamNames[team],
      value: team,
    }))
  )

  const handleSubmit = async (values, { setStatus }) => {
    try {
      const res = await fetch(`/api/workflows/${workflowId}/assignment`, {
        method: "PATCH",
        body: JSON.stringify({
          assignedTo: values.assignedTo || null,
          teamAssignedTo: values.teamAssignedTo || null,
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
      ) : assignment?.teamAssignedTo ? (
        <p className={`lbh-body-s ${s.assignee}`}>
          Assigned to {prettyTeamNames[assignment?.teamAssignedTo]} team ·{" "}
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
            teamAssignedTo: assignment?.teamAssignedTo || "",
          }}
          onSubmit={handleSubmit}
        >
          {({ submitForm, setFieldValue, isSubmitting }) => (
            <Form className={s.form}>
              <FormStatusMessage />

              <SelectField
                name="teamAssignedTo"
                label="Team"
                touched={null}
                errors={null}
                choices={teamChoices}
              />

              {users?.length > 0 && (
                <SelectField
                  name="assignedTo"
                  label="Who is working on this?"
                  touched={null}
                  errors={null}
                  choices={choices}
                  associatedAction={
                    assignment?.assignee?.email !== session?.user?.email && (
                      <button
                        type="submit"
                        className="lbh-link"
                        onClick={() => {
                          setFieldValue("assignedTo", session.user.email)
                          submitForm()
                        }}
                      >
                        Assign to me
                      </button>
                    )
                  }
                />
              )}

              <button
                type="submit"
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

export default AssignmentWidget
