import Layout from "../../../components/_Layout"
import { useRouter } from "next/router"
import { Form, Formik } from "formik"
import PageAnnouncement from "../../../components/PageAnnouncement"
import { finishSchema } from "../../../lib/validators"
import ResidentWidget from "../../../components/ResidentWidget"
import { GetServerSideProps } from "next"
import { getWorkflow } from "../../../lib/serverQueries"
import { Workflow } from "@prisma/client"
import TextField from "../../../components/FlexibleForms/TextField"
import { useSession } from "next-auth/client"
import useResident from "../../../hooks/useResident"

const NewWorkflowPage = (workflow: Workflow): React.ReactElement => {
  const { push, query } = useRouter()
  const [session] = useSession()
  const { data: resident } = useResident(workflow.socialCareId)

  const handleSubmit = async (values, { setStatus }) => {
    try {
      const res = await fetch(`/api/workflows/${query.id}`, {
        method: "PATCH",
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
      title="Send for approval"
      breadcrumbs={[
        { href: "/", text: "Dashboard" },
        {
          href: `/workflows/${query.id}`,
          text: `Workflow`,
        },
        { current: true, text: "Send for approval" },
      ]}
    >
      <fieldset>
        <div className="govuk-grid-row govuk-!-margin-bottom-8">
          <h1 className="govuk-grid-column-two-thirds">
            <legend>Send for approval</legend>
          </h1>
        </div>
        <div className="govuk-grid-row">
          <Formik
            initialValues={{
              approverEmail: "",
              reviewBefore: new Date(),
              submittedAt: new Date(),
              submittedBy: session?.user?.email,
            }}
            onSubmit={handleSubmit}
            validationSchema={finishSchema}
          >
            {({ errors, touched, status, isSubmitting }) => (
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

                <TextField
                  name="approverEmail"
                  label="Who should approve this?"
                  hint="Enter the email address of a manager or colleague."
                  errors={errors}
                  touched={touched}
                  className="govuk-input--width-20"
                />

                <TextField
                  name="reviewBefore"
                  label="When should this be reviewed?"
                  errors={errors}
                  touched={touched}
                  className="govuk-input--width-10"
                  type="date"
                />

                <button
                  disabled={isSubmitting}
                  className="govuk-button lbh-button"
                >
                  Finish and send
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

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const { id } = query

  const workflow = await getWorkflow(id as string)

  // redirect if resident doesn't exist
  if (!workflow)
    return {
      props: {},
      redirect: {
        destination: "/404",
      },
    }

  return {
    props: {
      ...JSON.parse(JSON.stringify(workflow)),
    },
  }
}

export default NewWorkflowPage
