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
import Link from "next/link"
import useNextSteps from "../hooks/useNextSteps"

export enum ApprovalActions {
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
  const { data: nextSteps } = useNextSteps()

  const nextStepsRequiringQam = workflow.nextSteps
    .map(nextStep =>
      nextSteps.options.find(
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
        method: values.action === ApprovalActions.Return ? "DELETE" : "POST",
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
          comment: "",
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
                  value: ApprovalActions.ApproveWithQam,
                },
                {
                  label: "Yes, approve—no QAM is needed",
                  value: ApprovalActions.ApproveWithoutQam,
                },
                {
                  label: "No, return for edits",
                  value: ApprovalActions.Return,
                },
              ].filter(choice =>
                nextStepsRequiringQam.length > 0
                  ? choice.value !== ApprovalActions.ApproveWithoutQam
                  : true
              )}
            />

            {values.action === ApprovalActions.ApproveWithQam && (
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

            <TextField
              name="comment"
              label={
                values.action === ApprovalActions.Return
                  ? "What needs to be changed?"
                  : "Comments"
              }
              errors={errors}
              touched={touched}
              required={values.action === ApprovalActions.Return}
              as="textarea"
            />

            <div className="lbh-dialog__actions">
              <button type="submit" className="govuk-button lbh-button">
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

export default ManagerApprovalDialog
