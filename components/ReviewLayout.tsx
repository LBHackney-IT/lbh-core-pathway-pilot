import Layout from "../components/_Layout"
import useResident from "../hooks/useResident"
import { ReviewWithCreatorAndAssignee, Step } from "../types"
import s from "../styles/RevisionHistory.module.scss"
import ss from "./ReviewLayout.module.scss"
import { AutosaveIndicator } from "../contexts/autosaveContext"
import StepForm from "./FlexibleForms/StepForm"
import { generateInitialValues } from "../lib/utils"
import { FormikHelpers, FormikValues } from "formik"
import ReadOnlyForm from "./ReadOnlyForm"

interface Props {
  workflow: ReviewWithCreatorAndAssignee
  step: Step
}

const ReviewOverviewLayout = ({
  workflow,
  step,
}: Props): React.ReactElement => {
  const { data: resident } = useResident(workflow.socialCareId)

  const title = resident
    ? `${resident.firstName} ${resident.lastName}`
    : "Workflow details"

  const previousAnswers = workflow.reviewOf.answers?.[step.id]
  const answers = workflow.answers?.[step.id]

  const handleSubmit = async (
    values: FormikValues,
    { setStatus }: FormikHelpers<FormikValues>
  ): Promise<void> => {
    try {
      const res = await fetch(
        `/api/workflows/${workflow.id}/steps/${step.id}`,
        {
          body: JSON.stringify(values),
          method: "PATCH",
        }
      )
      const data = await res.json()
      if (data.error) throw data.error
    } catch (e) {
      console.log(e)
      setStatus(e.toString())
    }
  }

  const handleCopy = () => {}

  return (
    <Layout
      fullWidth
      title={title}
      breadcrumbs={[
        { href: "/", text: "Dashboard" },
        { href: `/workflows/${workflow.id}`, text: "Workflow" },
        { href: `/workflows/${workflow.id}/steps`, text: "Task list" },
        { text: "Step XX", current: true },
      ]}
    >
      <div className={`lbh-container lmf-full-width ${s.header}`}>
        <div>
          <h1 className={`lbh-heading-h2 ${s.heading}`}>
            {title}
            {workflow.heldAt && (
              <span className="govuk-tag lbh-tag lbh-tag--yellow">On hold</span>
            )}
          </h1>
          {/* <AssignmentWidget workflowId={workflow.id} /> */}
        </div>
        <div>
          <AutosaveIndicator />
        </div>
      </div>

      <div className={ss.wrapper}>
        <div className={ss.mainPanel}>
          <aside className={ss.leftPanel}>
            <header className={ss.header}>
              <div>
                <p className="lbh-body-s">
                  <strong>Reviewing:</strong> Screening assessment
                </p>
                <p className={`lbh-body-xs ${ss.meta}`}>
                  Last reviewed XX (XX days ago) by XX
                </p>
              </div>

              <button
                onClick={handleCopy}
                className="govuk-button lbh-button lbh-button--secondary"
              >
                Copy all answers
              </button>
            </header>

            <ReadOnlyForm fields={step.fields} values={previousAnswers} />
          </aside>
          <div className={ss.rightPanel}>
            {step?.intro && <p>{step.intro}</p>}
            <StepForm
              onSubmit={handleSubmit}
              fields={step.fields}
              initialValues={answers || generateInitialValues(step.fields)}
            />
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default ReviewOverviewLayout
