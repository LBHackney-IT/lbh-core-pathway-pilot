import Layout from "../../components/_Layout"
import { useRouter } from "next/router"
import { Resident } from "../../types"
import { Form, Formik, Field } from "formik"
import PageAnnouncement from "../../components/PageAnnouncement"
import forms from "../../config/forms"
import { newWorkflowSchema } from "../../lib/validators"
import ResidentWidget from "../../components/ResidentWidget"
import { GetServerSideProps } from "next"
import { getResidentById } from "../../lib/residents"
import { getSession } from "next-auth/client"
import prisma from "../../lib/prisma"
import { Workflow } from "@prisma/client"

const NewWorkflowPage = (resident: Resident): React.ReactElement => {
  const { push } = useRouter()

  const choices = forms.map(form => ({
    label: form.name,
    value: form.id,
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
      if (workflow.id)
        push(`/workflows/${workflow.id}/confirm-personal-details`)
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
            <legend>What kind of assessment is this?</legend>
          </h1>
        </div>
        <div className="govuk-grid-row">
          <Formik
            initialValues={{
              formId: "",
              socialCareId: resident.mosaicId,
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

                <div className="govuk-radios lbh-radios">
                  {choices.map(choice => (
                    <div className="govuk-radios__item" key={choice.value}>
                      <Field
                        type="radio"
                        name="formId"
                        value={choice.value}
                        id={choice.value}
                        className="govuk-radios__input"
                      />

                      <label
                        className="govuk-label govuk-radios__label"
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

export const getServerSideProps: GetServerSideProps = async req => {
  const { social_care_id, form_id } = req.query

  // skip this page entirely if the right information is in the url
  if (social_care_id && form_id) {
    const session = await getSession(req)
    const newWorkflow: Workflow = await prisma.workflow.create({
      data: {
        socialCareId: social_care_id,
        formId: form_id,
        createdBy: session.user.email,
        updatedBy: session.user.email,
        assignedTo: session.user.email,
      },
    })
    return {
      props: {},
      redirect: {
        destination: `/workflows/${newWorkflow.id}/confirm-personal-details`,
      },
    }
  }

  const resident = await getResidentById(social_care_id as string)

  // redirect if resident doesn't exist
  if (!resident)
    return {
      props: {},
      redirect: {
        destination: "/404",
      },
    }

  return {
    props: {
      ...resident,
    },
  }
}

export default NewWorkflowPage
