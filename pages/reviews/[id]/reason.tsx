import Layout from "../../../components/_Layout"
import { getWorkflowServerSide } from "../../../lib/serverSideProps"
import { Workflow } from "@prisma/client"
import useResident from "../../../hooks/useResident"
import ResidentWidget from "../../../components/ResidentWidget"
import { ErrorMessage, Field, Form, Formik, getIn } from "formik"
import PageAnnouncement from "../../../components/PageAnnouncement"
import { useRouter } from "next/router"
import TextField from "../../../components/FlexibleForms/TextField"
import { reviewReasonSchema } from "../../../lib/validators"

const NewReviewPage = (workflow: Workflow): React.ReactElement => {
  const { data: resident } = useResident(workflow.socialCareId)
  const { push } = useRouter()

  const handleSubmit = async (values, { setStatus }) => {
    try {
      const res = await fetch(`/api/workflows/${workflow.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          ...values,
        }),
      })
      const data = await res.json()
      // if (data.id) push(`/reviews/${workflow.id}`)
    } catch (e) {
      setStatus(e.toString())
    }
  }

  return (
    <Layout
      title="Reason for review"
      breadcrumbs={[
        { href: "/", text: "Dashboard" },
        {
          href: `${process.env.NEXT_PUBLIC_SOCIAL_CARE_APP_URL}/people/${resident?.mosaicId}`,
          text: `${resident?.firstName} ${resident?.lastName}`,
        },
        { current: true, text: "Reason for review" },
      ]}
    >
      <fieldset>
        <div className="govuk-grid-row govuk-!-margin-bottom-8">
          <h1 className="govuk-grid-column-two-thirds">
            <legend>Is this a planned or unplanned review?</legend>
          </h1>
        </div>
        <div className="govuk-grid-row">
          <Formik
            initialValues={{
              answers: workflow.answers,
            }}
            onSubmit={handleSubmit}
            validationSchema={reviewReasonSchema}
          >
            {({ values, errors, touched, status, isSubmitting }) => (
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

                <div
                  className={`govuk-radios lbh-radios ${
                    getIn(touched, "answers.review.type") &&
                    getIn(errors, "answers.review.type") &&
                    "govuk-form-group--error"
                  }`}
                >
                  <ErrorMessage name="answers.review.type">
                    {msg => (
                      <p
                        className="govuk-error-message lbh-error-message"
                        role="alert"
                      >
                        <span className="govuk-visually-hidden">Error:</span>
                        {msg}
                      </p>
                    )}
                  </ErrorMessage>

                  <div className="govuk-radios__item">
                    <Field
                      type="radio"
                      name="answers.review.type"
                      value="Planned"
                      id="planned"
                      className="govuk-radios__input"
                    />

                    <label
                      className="govuk-label govuk-radios__label"
                      htmlFor="planned"
                    >
                      Planned
                    </label>
                  </div>
                  <div className="govuk-radios__item">
                    <Field
                      type="radio"
                      name="answers.review.type"
                      value="Unplanned"
                      id="unplanned"
                      className="govuk-radios__input"
                      data-aria-controls="reason"
                    />

                    <label
                      className="govuk-label govuk-radios__label"
                      htmlFor="unplanned"
                    >
                      Unplanned
                    </label>
                  </div>

                  {values.answers?.review?.type === "Unplanned" && (
                    <div className="govuk-radios__conditional" id="reason">
                      <TextField
                        label="What is the reason for this review?"
                        name="answers.review.reason"
                        errors={errors}
                        touched={touched}
                        as="textarea"
                      />
                    </div>
                  )}
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
