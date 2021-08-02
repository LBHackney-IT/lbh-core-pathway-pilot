import { useRouter } from "next/router"
import StepForm from "../../../../components/FlexibleForms/StepForm"
import ResidentWidget from "../../../../components/ResidentWidget"
import Layout from "../../../../components/_Layout"
import { allSteps } from "../../../../config/forms"
import { getWorkflowServerSide } from "../../../../lib/serverSideProps"
import { generateInitialValues } from "../../../../lib/utils"
import { WorkflowWithCreator } from "../../../../types"

const StepPage = (workflow: WorkflowWithCreator): React.ReactElement => {
  const { query } = useRouter()

  const step = allSteps.find(step => step.id === query.stepId)

  return (
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
          <StepForm
            onSubmit={() => true}
            fields={step.fields}
            initialValues={generateInitialValues(step.fields)}
          />
        </div>
        <div className="govuk-grid-column-one-third">
          <ResidentWidget socialCareId={workflow.socialCareId} />
        </div>
      </div>
    </Layout>
  )
}

export const getServerSideProps = getWorkflowServerSide

export default StepPage
