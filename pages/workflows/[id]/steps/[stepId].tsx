import { FormikHelpers, FormikValues } from "formik"
import { useRouter } from "next/router"
import StepForm from "../../../../components/FlexibleForms/StepForm"
import ResidentWidget from "../../../../components/ResidentWidget"
import Layout from "../../../../components/_Layout"
import { allSteps } from "../../../../config/forms"
import AutosaveContext, {
  AutosaveIndicator,
  AutosaveProvider,
} from "../../../../contexts/autosaveContext"
import { getWorkflowServerSide } from "../../../../lib/serverSideProps"
import { generateInitialValues } from "../../../../lib/utils"
import { WorkflowWithCreator } from "../../../../types"

const StepPage = (workflow: WorkflowWithCreator): React.ReactElement => {
  const { query } = useRouter()

  const step = allSteps.find(step => step.id === query.stepId)
  const answers = workflow.answers?.[step.id]

  const handleSubmit = async (
    values: FormikValues,
    { setStatus }: FormikHelpers<FormikValues>
  ): Promise<void> => {
    try {
      await fetch(`/api/workflows/${workflow.id}/steps/${step.id}`, {
        body: JSON.stringify(values),
        method: "PATCH",
      })
    } catch (e) {
      setStatus(e.toString())
    }
  }

  return (
    <AutosaveProvider>
      <Layout
        title={step.name}
        breadcrumbs={[
          { href: "/", text: "Dashboard" },
          { href: `/workflows/${workflow.id}`, text: "Workflow" },
          { href: `/workflows/${workflow.id}/steps`, text: "Task list" },
          { current: true, text: step.name },
        ]}
      >
        <div className="govuk-grid-row govuk-!-margin-bottom-8">
          <div className="govuk-grid-column-two-thirds">
            <h1>{step.name}</h1>
          </div>
        </div>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            {step?.intro && <p>{step.intro}</p>}
            <StepForm
              onSubmit={handleSubmit}
              fields={step.fields}
              initialValues={answers || generateInitialValues(step.fields)}
            />
          </div>
          <div className="govuk-grid-column-one-third">
            <AutosaveIndicator />
            <ResidentWidget socialCareId={workflow.socialCareId} />
          </div>
        </div>
      </Layout>
    </AutosaveProvider>
  )
}

export const getServerSideProps = getWorkflowServerSide

export default StepPage
