import Layout from "../components/_Layout"
import useResident from "../hooks/useResident"
import { WorkflowWithExtras, Step, StepAnswers } from "../types"
import s from "../styles/RevisionHistory.module.scss"
import ss from "./ReviewLayout.module.scss"
import { AutosaveIndicator } from "../contexts/autosaveContext"
import StepForm from "./FlexibleForms/StepForm"
import { generateInitialValues } from "../lib/utils"
import { FormikHelpers, FormikValues } from "formik"
import ReadOnlyForm from "./ReadOnlyForm"
import {
  prettyDate,
  prettyDateToNow,
  prettyResidentName,
} from "../lib/formatters"
import { useState } from "react"

interface Props {
  workflow: WorkflowWithExtras
  step: Step
}

const ReviewOverviewLayout = ({
  workflow,
  step,
}: Props): React.ReactElement => {
  const { data: resident } = useResident(workflow.socialCareId)

  const title = resident ? prettyResidentName(resident) : "Workflow details"

  const previousAnswers = workflow.reviewOf.answers?.[step.id] || {}

  const [answers, setAnswers] = useState<StepAnswers>(
    workflow.answers?.[step.id] || generateInitialValues(step.fields)
  )

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
      setStatus(e.toString())
    }
  }

  const handleCopy = () => setAnswers(previousAnswers)

  return (
    <Layout
      fullWidth
      title={title}
      breadcrumbs={[
        { href: "/", text: "Dashboard" },
        { href: `/workflows/${workflow.id}`, text: "Workflow" },
        { href: `/workflows/${workflow.id}/steps`, text: "Task list" },
        { text: step.name, current: true },
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
        </div>
        <div>
          <AutosaveIndicator />
        </div>
      </div>

      <div className={ss.wrapper}>
        <div className={ss.mainPanel}>
          <aside className={ss.leftPanel}>
            <ReadOnlyForm fields={step.fields} values={previousAnswers} />
            <footer className={ss.header}>
              <div>
                <p className="lbh-body-s">
                  <strong>Reviewing:</strong> {workflow.form.name}
                </p>
                <p className={`lbh-body-xs ${ss.meta}`}>
                  Last reviewed{" "}
                  {prettyDate(String(workflow.reviewOf.updatedAt))} (
                  {prettyDateToNow(String(workflow.reviewOf.updatedAt))}) by XX
                </p>
              </div>

              <button
                onClick={handleCopy}
                className="govuk-button lbh-button lbh-button--secondary"
              >
                Copy all answers
              </button>
            </footer>
          </aside>
          <div className={ss.rightPanel}>
            <StepForm
              onSubmit={handleSubmit}
              fields={step.fields}
              initialValues={answers}
              acceptCopiedAnswers
            />
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default ReviewOverviewLayout
