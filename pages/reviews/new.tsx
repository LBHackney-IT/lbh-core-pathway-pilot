import Layout from "../../components/_Layout"
import { getWorkflowServerSide } from "../../lib/serverSideProps"
import { Workflow } from "@prisma/client"
import useResident from "../../hooks/useResident"
import { buildThemes } from "../../lib/taskList"
import ResidentWidget from "../../components/ResidentWidget"
import { Field, Form, Formik } from "formik"
import PageAnnouncement from "../../components/PageAnnouncement"
import { useRouter } from "next/router"
import { newWorkflowSchema } from "../../lib/validators"

const NewReviewPage = (previousWorkflow: Workflow): React.ReactElement => {
  const { data: resident } = useResident(previousWorkflow.socialCareId)
  const { push } = useRouter()

  const themes = buildThemes(previousWorkflow)

  const choices = themes.map(theme => ({
    label: theme.name,
    value: theme.id,
  }))

  const handleSubmit = async (values, { setStatus }) => {
    try {
      const res = await fetch(`/api/workflows`, {
        method: "POST",
        body: JSON.stringify({
          ...values,
        }),
      })
      const workflow = await res.json()
      if (workflow.id) push(`/reviews/${workflow.id}/reason`)
    } catch (e) {
      setStatus(e.toString())
    }
  }

  return (
    <Layout
      title="Review a workflow"
      breadcrumbs={[
        { href: "/", text: "Dashboard" },
        {
          href: `${process.env.NEXT_PUBLIC_SOCIAL_CARE_APP_URL}/people/${resident?.mosaicId}`,
          text: `${resident?.firstName} ${resident?.lastName}`,
        },
        { current: true, text: "Review a workflow" },
      ]}
    >
      <fieldset>
        <div className="govuk-grid-row govuk-!-margin-bottom-8">
          <h1 className="govuk-grid-column-two-thirds">
            <legend>Which parts do you want to review?</legend>
          </h1>
        </div>
        <div className="govuk-grid-row">
          <Formik
            initialValues={{
              reviewedThemes: [],
              workflowId: previousWorkflow.id,
              socialCareId: previousWorkflow.socialCareId,
            }}
            onSubmit={handleSubmit}
            validationSchema={newWorkflowSchema}
          >
            {({ status, isSubmitting }) => (
              <Form className="govuk-grid-column-two-thirds">
                {status && (
                  <PageAnnouncement
                    className="lbh-page-announcement--warning"
                    title="There was a problem submitting your answers"
                  >
                    <p>Refresh the page or try again later.</p>
                    <p className="lbh-body-xs">{status}</p>
                  </PageAnnouncement>
                )}

                <div className="govuk-checkboxes lbh-checkboxes">
                  {choices.map(choice => (
                    <div className="govuk-checkboxes__item" key={choice.value}>
                      <Field
                        type="checkbox"
                        name="reviewedThemes"
                        value={choice.value}
                        id={choice.value}
                        className="govuk-checkboxes__input"
                      />

                      <label
                        className="govuk-label govuk-checkboxes__label"
                        htmlFor={choice.value}
                      >
                        {choice.label}
                      </label>
                    </div>
                  ))}
                </div>

                <button
                  disabled={isSubmitting}
                  className="govuk-button lbh-button"
                >
                  Continue
                </button>
              </Form>
            )}
          </Formik>

          <div className="govuk-grid-column-one-third">
            <ResidentWidget socialCareId={resident?.mosaicId} />
          </div>
        </div>
      </fieldset>
    </Layout>
  )
}

export const getServerSideProps = getWorkflowServerSide

export default NewReviewPage
