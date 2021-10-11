import Layout from "../components/_Layout"
import WorkflowList from "../components/WorkflowList"
import { Form, Resident, Status } from "../types"
import { GetServerSideProps } from "next"
import { getResidentById } from "../lib/residents"
import { prettyResidentName } from "../lib/formatters"
import Filters from "../components/Filters"
import { filterByStatus } from "../lib/filters"
import { Prisma, WorkflowType } from "@prisma/client"
import prisma from "../lib/prisma"
import forms from "../config/forms"
import Pagination from "../components/Pagination"

interface Props {
  forms: Form[]
  workflows: WorkflowWithRelations[]
  resident?: Resident
  currentPage: number
  totalPages: number
}

const workflowWithRelations = Prisma.validator<Prisma.WorkflowArgs>()({
  include: {
    creator: true,
    assignee: true,
    submitter: true,
    nextReview: true,
    comments: true,
  },
})
type WorkflowWithRelations = Prisma.WorkflowGetPayload<
  typeof workflowWithRelations
>

const IndexPage = ({
  forms,
  workflows,
  resident,
  currentPage,
  totalPages,
}: Props): React.ReactElement => {
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
      <h1>
        {resident
          ? `Workflows for ${prettyResidentName(resident)}`
          : "Workflows"}
      </h1>
      <Filters forms={forms} />
      <WorkflowList workflows={workflows} />
      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async req => {
  const {
    social_care_id,
    status,
    form_id,
    only_reviews_reassessments,
    sort,
    page,
  } = req.query

  let orderBy: Prisma.WorkflowOrderByInput = { updatedAt: "desc" }
  if (sort === "recently-started") orderBy = { createdAt: "desc" }

  const whereArgs: Prisma.WorkflowWhereInput = {
    formId: form_id ? (form_id as string) : undefined,
    discardedAt: status === Status.Discarded ? { not: null } : null,
    socialCareId: social_care_id as string,
    type:
      only_reviews_reassessments === "true"
        ? {
            in: [WorkflowType.Reassessment, WorkflowType.Review],
          }
        : undefined,
    ...filterByStatus(status as Status),
    // hide things that have already been reviewed
    nextReview: {
      is: null,
    },
  }

  const [workflows, count] = await Promise.all([
    prisma.workflow.findMany({
      where: whereArgs,
      take: perPage,
      skip: page ? parseInt(page as string) * perPage : 0,
      include: {
        creator: true,
        assignee: true,
        submitter: true,
        nextReview: true,
        comments: true,
      },
      // put things that are in progress below the rest
      orderBy: [{ submittedAt: "asc" }, orderBy],
    }),
    prisma.workflow.count({
      where: whereArgs,
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
      currentPage: page || 1,
      totalPages: Math.floor(count / perPage),
    },
  }
}

export default IndexPage
