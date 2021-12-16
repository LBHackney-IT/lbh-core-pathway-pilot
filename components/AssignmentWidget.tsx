import { Form, Formik } from "formik"
import {useContext, useState} from "react"
import Dialog from "./Dialog"
import SelectField from "./FlexibleForms/SelectField"
import useUsers from "../hooks/useUsers"
import useAssignment from "../hooks/useAssignment"
import s from "./AssignmentWidget.module.scss"
import FormStatusMessage from "./FormStatusMessage"
import { Team } from "@prisma/client"
import { prettyTeamNames } from "../config/teams"
import { csrfFetch } from "../lib/csrfToken"
import { Status } from "../types"
import UserOptions from "./UserSelect"
import {SessionContext} from "../lib/auth/SessionContext";

interface Props {
  workflowId: string
  status: Status
}

const AssignmentWidget = ({
  workflowId,
  status,
}: Props): React.ReactElement => {
  const { data: users } = useUsers()
  const { data: assignment, mutate } = useAssignment(workflowId)
  const user = useContext(SessionContext);
  const userIsInPilot = user?.inPilot

  const [dialogOpen, setDialogOpen] = useState<boolean>(false)

  const teamChoices = [{ label: "Unassigned", value: "" }].concat(
    Object.keys(Team).map(team => ({
      label: prettyTeamNames[team],
      value: team,
    }))
  )

  const handleSubmit = async (values, { setStatus }) => {
    try {
      const res = await csrfFetch(`/api/workflows/${workflowId}/assignment`, {
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
          {assignment?.assignee?.name || assignment?.assignee?.email}
          {userIsInPilot && (
            <>
              {" · "}
              <button onClick={() => setDialogOpen(true)}>Reassign</button>
            </>
          )}
        </p>
      ) : assignment?.teamAssignedTo ? (
        <p className={`lbh-body-s ${s.assignee}`}>
          Assigned to {prettyTeamNames[assignment?.teamAssignedTo]} team{" "}
          {userIsInPilot && (
            <>
              · <button onClick={() => setDialogOpen(true)}>Reassign</button>
            </>
          )}
        </p>
      ) : (
        <p className={`lbh-body-s ${s.assignee}`}>
          No one is assigned{" "}
          {userIsInPilot && (
            <>
              ·{" "}
              <button onClick={() => setDialogOpen(true)}>
                Assign someone?
              </button>
            </>
          )}
        </p>
      )}

      <Dialog
        onDismiss={() => setDialogOpen(false)}
        isOpen={dialogOpen}
        title="Reassign this workflow"
      >
        <p>
          Don&apos;t use this if you&apos;re trying to submit for approval or
          authorisation.
        </p>
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
                label="Assign to a team"
                touched={null}
                errors={null}
                choices={teamChoices}
              />

              {users?.length > 0 && (
                <SelectField
                  name="assignedTo"
                  label="Assign to a user"
                  touched={null}
                  errors={null}
                  choices={
                    <UserOptions
                      users={users?.filter(user =>
                        status === Status.ManagerApproved
                          ? user.panelApprover
                          : true
                      )}
                      default={{ label: "Unassigned", value: "" }}
                    />
                  }
                  associatedAction={
                    assignment?.assignee?.email !== user?.email && (
                      <button
                        type="submit"
                        className="lbh-link"
                        onClick={() => {
                          setFieldValue("assignedTo", user?.email)
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
