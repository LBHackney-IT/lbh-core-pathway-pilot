import Layout from "../../components/_Layout"
import { useRouter } from "next/router"
import { Resident } from "../../types"
import { getResidentServerSide } from "../../lib/serverSideProps"
import { Form, Formik, Field } from "formik"
import PageAnnouncement from "../../components/PageAnnouncement"
import { assessmentElements } from "../../config/forms"
import { assessmentElementsSchema } from "../../lib/validators"
import ResidentWidget from "../../components/ResidentWidget"

const NewWorkflowPage = (resident: Resident): React.ReactElement => {
  const { push } = useRouter()

  const choices = assessmentElements.map(element => ({
    label: element.name,
    value: element.id,
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
      if (workflow.id) push(`/workflows/${workflow.id}`)
    } catch (e) {
      setStatus(e.toString())
    }
  }

  return (
    <Layout
      title="Extra assessment elements"
      breadcrumbs={[
        { href: "/", text: "Dashboard" },
        {
          href: `${process.env.NEXT_PUBLIC_SOCIAL_CARE_APP_URL}/people/${resident.mosaicId}`,
          text: `${resident.firstName} ${resident.lastName}`,
        },
        { current: true, text: "Check details" },
      ]}
    >
      <fieldset>
        <div className="govuk-grid-row govuk-!-margin-bottom-8">
          <h1 className="govuk-grid-column-two-thirds">
            <legend>Do you want to add any extra assessment elements?</legend>
          </h1>
        </div>
        <div className="govuk-grid-row">
          <Formik
            initialValues={{
              assessmentElements: [],
              socialCareId: resident.mosaicId,
            }}
            onSubmit={handleSubmit}
            validationSchema={assessmentElementsSchema}
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
                        name="assessmentElements"
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
            <ResidentWidget socialCareId={resident.mosaicId} />
          </div>
        </div>
      </fieldset>
    </Layout>
  )
}

export const getServerSideProps = getResidentServerSide

export default NewWorkflowPage
