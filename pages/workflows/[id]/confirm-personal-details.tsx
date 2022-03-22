import WarningPanel from "../../../components/WarningPanel"
import Layout from "../../../components/_Layout"
import s from "../../../components/WarningPanel.module.scss"
import ResidentDetailsList from "../../../components/ResidentDetailsList"
import { Resident, Status } from "../../../types"
import Link from "next/link"
import { getResidentById } from "../../../lib/residents"
import { GetServerSideProps } from "next"
import { useRouter } from "next/router"
import { prettyResidentName } from "../../../lib/formatters"
import prisma from "../../../lib/prisma"
import { Workflow } from ".prisma/client"
import { getStatus } from "../../../lib/status"
import { protectRoute } from "../../../lib/protectRoute"
import { pilotGroup } from "../../../config/allowedGroups";
import useForms from "../../../hooks/useForms";

interface Props {
  resident: Resident
  workflow: Workflow
}

export const NewWorkflowPage = ({
  resident,
  workflow,
}: Props): React.ReactElement => {
  const { query } = useRouter()

  const isUnlinkedReassessment = query["unlinked_reassessment"] === "true"

  const status = getStatus(workflow, null)
  const isReassessment = [
    Status.NoAction,
    Status.ReviewSoon,
    Status.Overdue,
  ].includes(status)

  const breadcrumbs = [
    {
      href: `${process.env.NEXT_PUBLIC_SOCIAL_CARE_APP_URL}/people/${resident?.mosaicId}`,
      text: prettyResidentName(resident),
    },
  ]

  if (isReassessment)
    breadcrumbs.push({
      href: `/workflows/${workflow.id}`,
      text: "Workflow",
    })

  return (
    <Layout
      title="Are the personal details correct?"
      breadcrumbs={[...breadcrumbs, { current: true, text: "Check details" }]}
    >
      <WarningPanel>
        <h1 className="lbh-heading-h2">
          Are their personal details still correct?
        </h1>
        <p>
          You need to confirm these before{" "}
          {isReassessment || isUnlinkedReassessment ? "reassessing" : "starting"} a workflow.
        </p>

        <ResidentDetailsList resident={resident} />

        <div className={s.twoActions}>
          <Link
            href={
              isReassessment || isUnlinkedReassessment
                ? `/reviews/new?id=${workflow.id}${isUnlinkedReassessment ? "&unlinked_reassessment=true" : ""}`
                : `/workflows/${query.id}/steps`
            }
          >
            <a className="govuk-button lbh-button">Yes, they are correct</a>
          </Link>

          <a
            href={`${process.env.NEXT_PUBLIC_SOCIAL_CARE_APP_URL}/people/${resident.mosaicId}/edit?redirectUrl=${window.location.origin}/workflows/${workflow.id}/confirm-personal-details`}
            className="lbh-link lbh-link--no-visited-state"
          >
            No, amend
          </a>
        </div>
      </WarningPanel>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = protectRoute(
  async ({ query }) => {
    const { id } = query

    const workflow = await prisma.workflow.findUnique({
      where: {
        id: id as string,
      },
    })

    const resident = await getResidentById(workflow?.socialCareId)

    // redirect if resident or workflow doesn't exist
    if (!workflow || !resident)
      return {
        props: {},
        redirect: {
          destination: "/404",
        },
      }

    return {
      props: {
        resident,
        workflow: JSON.parse(JSON.stringify(workflow)),
      },
    }
  },
  [pilotGroup],
)

export default NewWorkflowPage
