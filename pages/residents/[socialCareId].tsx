import { GetServerSideProps } from "next"
import { useRouter } from "next/router"
import UnlinkedReassessmentPanel from "../../components/UnlinkedReassessmentPanel"
import WorkflowPanel, { WorkflowForPanel } from "../../components/WorkflowPanel"
import Layout from "../../components/_Layout"
import forms from "../../config/forms"
import { prettyResidentName } from "../../lib/formatters"
import prisma from "../../lib/prisma"
import { protectRoute } from "../../lib/protectRoute"
import { getResidentById } from "../../lib/residents"
import { Resident } from "../../types"

interface Props {
  resident: Resident
  workflows: WorkflowForPanel[]
}

const ResidentWorkflowsPage = ({
  resident,
  workflows,
}: Props): React.ReactElement => {
  const router = useRouter()
  const { socialCareId } = router.query

  return (
    <Layout
      title={
        resident ? `Workflows | ${prettyResidentName(resident)}` : "Workflows"
      }
      breadcrumbs={[
        {
          href: `${process.env.NEXT_PUBLIC_SOCIAL_CARE_APP_URL}/people/${socialCareId}`,
          text: resident
            ? prettyResidentName(resident)
            : (socialCareId as string),
        },
        { text: "Workflows", current: true },
      ]}
    >
      <h1 className="govuk-!-margin-bottom-8">Workflows</h1>

      {workflows.length > 0 ? (
        <section>
          {workflows.map(result => (
            <WorkflowPanel key={result.id} workflow={result} />
          ))}
        </section>
      ) : (
        <p className="lbh-body">This resident has no workflows.</p>
      )}

      <UnlinkedReassessmentPanel socialCareId={socialCareId as string} />
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = protectRoute(
  async req => {
    const { socialCareId } = req.query

    const [resolvedForms, resident, workflows] = await Promise.all([
      await forms(),
      await getResidentById(socialCareId as string),
      await prisma.workflow.findMany({
        where: {
          socialCareId: socialCareId as string,
          discardedAt: null,
        },
        orderBy: [{ heldAt: "desc" }, { createdAt: "desc" }],
      }),
    ])

    return {
      props: {
        resident,
        workflows: JSON.parse(
          JSON.stringify(
            workflows.map(workflow => ({
              ...workflow,
              form: resolvedForms.find(form => form.id === workflow.formId),
            }))
          )
        ),
      },
    }
  }
)

export default ResidentWorkflowsPage
