import Layout from "../components/_Layout"
import useResident from "../hooks/useResident"
import { FlexibleAnswers, Form, Step, StepAnswers } from "../types"
import s from "../styles/LeftSidebar.module.scss"
import ss from "./ReviewLayout.module.scss"
import { AutosaveIndicator } from "../contexts/autosaveContext"
import StepForm from "./FlexibleForms/StepForm"
import { generateInitialValues } from "../lib/forms"
import { FormikHelpers, FormikValues } from "formik"
import ReadOnlyForm from "./ReadOnlyForm"
import {
  prettyDate,
  prettyDateToNow,
  prettyResidentName,
} from "../lib/formatters"
import { useState } from "react"
import { Prisma } from "@prisma/client"
import { csrfFetch } from "../lib/csrfToken"

const workflowWithRelations = Prisma.validator<Prisma.WorkflowArgs>()({
  include: {
    previousReview: true,
  },
})
type WorkflowWithRelations = Prisma.WorkflowGetPayload<
  typeof workflowWithRelations
> & { form?: Form }

interface Props {
  workflow: WorkflowWithRelations
  step: Step
}

const ReviewOverviewLayout = ({
  workflow,
  step,
}: Props): React.ReactElement => {
  const { data: resident } = useResident(workflow.socialCareId)

  const title = resident ? prettyResidentName(resident) : "Workflow details"

  const previousAnswers = workflow?.previousReview?.answers?.[step.id] || {}

  const [answers, setAnswers] = useState<StepAnswers>(
    workflow.answers?.[step.id] || generateInitialValues(step.fields)
  )

  const handleSubmit = async (
    values: FormikValues,
    { setStatus }: FormikHelpers<FormikValues>
  ): Promise<void> => {
    try {
      const res = await csrfFetch(
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
        {
          href: `${process.env.NEXT_PUBLIC_SOCIAL_CARE_APP_URL}/people/${resident?.mosaicId}`,
          text: prettyResidentName(resident),
        },
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
              <span className="govuk-tag lbh-tag lbh-tag--yellow">Urgent</span>
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
            {workflow.previousReview ? (
              <>
                <ReadOnlyForm fields={step.fields} values={previousAnswers} />
                <footer className={ss.metaPanel}>
                  <div>
                    <p className="lbh-body-s">
                      <strong>Reassessing:</strong> {workflow.form.name}
                    </p>
                    <p className={`lbh-body-xs ${ss.meta}`}>
                      Last reviewed{" "}
                      {prettyDate(String(workflow.previousReview.updatedAt))} (
                      {prettyDateToNow(
                        String(workflow.previousReview.updatedAt)
                      )}
                      ){" "}
                      {workflow.previousReview?.submittedBy &&
                        `by ${workflow.previousReview?.submittedBy}`}
                    </p>
                  </div>

                  <button
                    onClick={handleCopy}
                    className="govuk-button lbh-button lbh-button--secondary"
                  >
                    Copy all answers
                  </button>
                </footer>
              </>
            ) : (
              <p className={`lbh-body-l ${ss.noPrevious}`}>
                Unlinked reassessment—no previous workflow
              </p>
            )}
          </aside>
          <div className={ss.rightPanel}>
            <StepForm
              onSubmit={handleSubmit}
              fields={step.fields}
              answers={workflow.answers as FlexibleAnswers}
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
