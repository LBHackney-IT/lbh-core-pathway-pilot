import Dialog from "./Dialog"
import { useRouter } from "next/router"
import { Form, Formik } from "formik"
import { managerApprovalSchema } from "../lib/validators"
import useUsers from "../hooks/useUsers"
import RadioField from "./FlexibleForms/RadioField"
import TextField from "./FlexibleForms/TextField"
import SelectField from "./FlexibleForms/SelectField"
import FormStatusMessage from "./FormStatusMessage"
import { Prisma } from "@prisma/client"
import { csrfFetch } from "../lib/csrfToken"
import nextStepOptions from "../config/nextSteps/nextStepOptions"

export enum Actions {
  ApproveWithQam = "approve-with-qam",
  ApproveWithoutQam = "approve-without-qam",
  Return = "return",
}

const workflowWithNextSteps = Prisma.validator<Prisma.WorkflowArgs>()({
  include: {
    nextSteps: true,
  },
})

type WorkflowWithNextSteps = Prisma.WorkflowGetPayload<
  typeof workflowWithNextSteps
>

interface Props {
  workflow: WorkflowWithNextSteps
  isOpen: boolean
  onDismiss: (value: boolean) => void
}

const ManagerApprovalDialog = ({
  workflow,
  isOpen,
  onDismiss,
}: Props): React.ReactElement => {
  const { push } = useRouter()
  const { data: users } = useUsers()

  const nextStepsRequiringQam = workflow.nextSteps
    .map(nextStep =>
      nextStepOptions.find(
        nextStepOption =>
          nextStep.nextStepOptionId === nextStepOption.id &&
          nextStepOption.waitForQamApproval
      )
    )
    .filter(nextStep => !!nextStep)

  const panelApproverChoices = [{ label: "", value: "" }].concat(
    users
      ?.filter(user => user.panelApprover)
      ?.map(user => ({
        label: `${user.name} (${user.email})`,
        value: user.email,
      })) || []
  )

  const handleSubmit = async (values, { setStatus }) => {
    try {
      const res = await csrfFetch(`/api/workflows/${workflow.id}/approval`, {
        method: values.action === Actions.Return ? "DELETE" : "POST",
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
    <Dialog onDismiss={() => onDismiss(false)} isOpen={isOpen} title="Approval">
      <Formik
        initialValues={{
          action: "",
          reason: "",
          panelApproverEmail: "",
        }}
        onSubmit={handleSubmit}
        validationSchema={managerApprovalSchema}
      >
        {({ values, touched, errors }) => (
          <Form>
            <FormStatusMessage />

            {nextStepsRequiringQam.length > 0 && (
              <div className="govuk-inset-text lbh-inset-text">
                <p>
                  <strong>This workflow must be sent for QAM</strong>
                </p>

                <p>
                  Some of this workflow&apos;s next steps need QAM
                  authorisation:
                </p>

                <ul className="lbh-list lbh-list--bullet">
                  {nextStepsRequiringQam.map(nextStepOption => (
                    <li key={nextStepOption.id}>{nextStepOption.title}</li>
                  ))}
                </ul>
              </div>
            )}

            <RadioField
              name="action"
              required
              touched={touched}
              errors={errors}
              label="Do you want to approve this work?"
              choices={[
                {
                  label: "Yes, approve and send to QAM",
                  value: Actions.ApproveWithQam,
                },
                {
                  label: "Yes, approve—no QAM is needed",
                  value: Actions.ApproveWithoutQam,
                },
                {
                  label: "No, return for edits",
                  value: Actions.Return,
                },
              ].filter(choice =>
                nextStepsRequiringQam.length > 0
                  ? choice.value !== Actions.ApproveWithoutQam
                  : true
              )}
            />

            {values.action === Actions.ApproveWithQam && (
              <SelectField
                name="panelApproverEmail"
                label="Who should authorise this?"
                hint="They'll be notified by email"
                errors={errors}
                touched={touched}
                choices={panelApproverChoices}
                required
              />
            )}

            {values.action === Actions.ApproveWithQam && (
              <TextField
                name="comment"
                label="Any comments for QAM?"
                errors={errors}
                touched={touched}
                as="textarea"
              />
            )}

            {values.action === Actions.Return && (
              <TextField
                name="reason"
                label="What needs to be changed?"
                errors={errors}
                touched={touched}
                required={true}
                as="textarea"
              />
            )}

            <div className="lbh-dialog__actions">
              <button type="submit" className="govuk-button lbh-button">
                Submit
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </Dialog>
  )
}

export default ManagerApprovalDialog
