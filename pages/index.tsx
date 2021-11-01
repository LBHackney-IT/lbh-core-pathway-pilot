import Layout from "../components/_Layout"
import WorkflowList, { Filter } from "../components/WorkflowList"
import { Form, Resident, Status } from "../types"
import { GetServerSideProps } from "next"
import { getResidentById } from "../lib/residents"
import { prettyResidentName } from "../lib/formatters"
import Filters from "../components/Filters"
import { filterByStatus } from "../lib/filters"
import { Prisma, WorkflowType } from "@prisma/client"
import prisma from "../lib/prisma"
import forms from "../config/forms"
import ShortcutNav from "../components/ShortcutNav"
import { perPage } from "../config"
import { getSession } from "next-auth/client"
import { protectRoute } from "../lib/protectRoute"
import useQueryParams from "../hooks/useQueryParams"
import Pagination from "../components/Pagination"
import UnlinkedReassessmentPanel from "../components/UnlinkedReassessmentPanel"

interface Props {
  forms: Form[]
  workflows: WorkflowWithRelations[]
  resident?: Resident
  workflowTotals: {
    All: number
    "Work assigned to me": number
    Team: number
  }
  tab: string
  currentPage: number
}

const workflowWithRelations = Prisma.validator<Prisma.WorkflowArgs>()({
  include: {
    creator: true,
    assignee: true,
    submitter: true,
    nextReview: true,
    comments: true,
    managerApprover: true,
    panelApprover: true,
  },
})
type WorkflowWithRelations = Prisma.WorkflowGetPayload<
  typeof workflowWithRelations
>

const IndexPage = ({
  forms,
  workflows,
  resident,
  workflowTotals,
  tab,
  currentPage,
}: Props): React.ReactElement => {
  const [queryParams, updateQueryParams] = useQueryParams({
    tab,
    page: currentPage,
  })

  return (
    <Layout
      title={
        resident ? `Workflows | ${prettyResidentName(resident)}` : "Workflows"
      }
      breadcrumbs={
        resident
          ? [
              {
                href: `${process.env.NEXT_PUBLIC_SOCIAL_CARE_APP_URL}/people/${resident.mosaicId}`,
                text: prettyResidentName(resident),
              },
              { text: "Workflows", current: true },
            ]
          : [
              {
                href: process.env.NEXT_PUBLIC_SOCIAL_CARE_APP_URL,
                text: "My workspace",
              },
              { text: "Workflows", current: true },
            ]
      }
    >
      <h1 className="govuk-!-margin-bottom-6">
        {resident
          ? `Workflows for ${prettyResidentName(resident)}`
          : "Workflows"}
      </h1>

      <ShortcutNav />

      <Filters
        forms={forms}
        queryParams={queryParams}
        updateQueryParams={updateQueryParams}
      />
      <WorkflowList
        workflows={workflows}
        workflowTotals={workflowTotals}
        queryParams={queryParams}
        updateQueryParams={updateQueryParams}
      />
      <UnlinkedReassessmentPanel queryParams={queryParams} />
      <Pagination
        total={workflowTotals[queryParams["tab"] as string]}
        queryParams={queryParams}
        updateQueryParams={updateQueryParams}
      />
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = protectRoute(
  async req => {
    const {
      social_care_id,
      status,
      form_id,
      show_historic,
      only_reviews_reassessments,
      only_mine,
      sort,
      page,
      tab,
      assigned_to,
    } = req.query

    let orderBy: Prisma.WorkflowOrderByInput = { updatedAt: "desc" }
    if (sort === "recently-started") orderBy = { createdAt: "desc" }

    let type = {
      in: [
        WorkflowType.Reassessment,
        WorkflowType.Review,
        WorkflowType.Assessment,
      ],
    }
    if (show_historic) type = undefined
    if (only_reviews_reassessments)
      type = { in: [WorkflowType.Reassessment, WorkflowType.Review] }

    const session = await getSession(req)

    const whereArgs: Prisma.WorkflowWhereInput = {
      formId: form_id ? (form_id as string) : undefined,
      discardedAt: status === Status.Discarded ? { not: null } : null,
      socialCareId: social_care_id as string,
      createdBy: only_mine === "true" ? session?.user?.email : undefined,
      assignedTo: assigned_to ? (assigned_to as string) : undefined,
      type,
      ...filterByStatus(status as Status),
      // hide things that have already been reviewed
      nextReview: {
        is: null,
      },
    }

    if (tab === Filter.Team) {
      whereArgs.teamAssignedTo = {
        equals: session?.user?.team,
        not: null,
      }
    }
    if (tab === Filter.Me || !tab) whereArgs.assignedTo = session?.user?.email

    const [workflows, countMe, countTeam, countAll] = await Promise.all([
      prisma.workflow.findMany({
        where: whereArgs,
        take: perPage,
        skip: page ? parseInt(page as string) * perPage + 1 : 0,
        include: {
          creator: true,
          assignee: true,
          submitter: true,
          nextReview: true,
          comments: true,
          managerApprover: true,
          panelApprover: true,
        },
        // put things that are in progress below the rest
        orderBy: [{ submittedAt: "asc" }, orderBy],
      }),
      prisma.workflow.count({
        where: {
          ...whereArgs,
          teamAssignedTo: undefined,
          assignedTo: session?.user?.email,
        },
      }),
      prisma.workflow.count({
        where: {
          ...whereArgs,
          teamAssignedTo: {
            equals: session?.user?.team,
            not: null,
          },
          assignedTo: undefined,
        },
      }),
      prisma.workflow.count({
        where: {
          ...whereArgs,
          teamAssignedTo: undefined,
          assignedTo: undefined,
        },
      }),
    ])

    let resident = null
    if (social_care_id) {
      resident = await getResidentById(social_care_id as string)
    }

    const resolvedForms = await forms()

    return {
      props: {
        workflows: JSON.parse(
          JSON.stringify(
            workflows.map(workflow => ({
              ...workflow,
              form: resolvedForms.find(form => form.id === workflow.formId),
            }))
          )
        ),
        resident: JSON.parse(JSON.stringify(resident)),
        forms: resolvedForms,
        currentPage: Number(page) || 0,
        workflowTotals: {
          All: countAll,
          "Work assigned to me": countMe,
          Team: countTeam,
        },
        tab: tab || Filter.Me,
      },
    }
  }
)

export default IndexPage
