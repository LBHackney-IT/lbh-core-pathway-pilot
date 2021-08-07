import Layout from "../components/_Layout"
import useResident from "../hooks/useResident"
import { ReviewWithCreatorAndAssignee, Step } from "../types"
import s from "../styles/RevisionHistory.module.scss"
import ss from "./ReviewLayout.module.scss"
import { AutosaveIndicator } from "../contexts/autosaveContext"
import StepForm from "./FlexibleForms/StepForm"

interface Props {
  workflow: ReviewWithCreatorAndAssignee
  step: Step
}

const ReviewOverviewLayout = ({ workflow }: Props): React.ReactElement => {
  const { data: resident } = useResident(workflow.socialCareId)

  const title = resident
    ? `${resident.firstName} ${resident.lastName}`
    : "Workflow details"

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

              <button className="govuk-button lbh-button lbh-button--secondary">
                Copy all answers
              </button>
            </header>
            Review content
          </aside>
          <div className={ss.rightPanel}>
            Step form
            <div style={{ height: "2000px" }}></div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default ReviewOverviewLayout
