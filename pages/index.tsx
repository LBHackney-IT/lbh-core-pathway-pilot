import Layout from "../components/_Layout"
import WorkflowList from "../components/WorkflowList"
import { Resident, Status } from "../types"
import { GetServerSideProps } from "next"
import { getResidentById } from "../lib/residents"
import { prettyResidentName } from "../lib/formatters"
import Filters from "../components/Filters"
import { filterByStatus } from "../lib/filters"
import { Prisma, WorkflowType } from "@prisma/client"
import prisma from "../lib/prisma"
import forms from "../config/forms"

interface Props {
  workflows: WorkflowWithRelations[]
  resident?: Resident
}

const workflowWithRelations = Prisma.validator<Prisma.WorkflowArgs>()({
  include: {
    creator: true,
    assignee: true,
    nextReview: true,
  },
})
type WorkflowWithRelations = Prisma.WorkflowGetPayload<
  typeof workflowWithRelations
>

const IndexPage = ({ workflows, resident }: Props): React.ReactElement => {
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
      <h1>Workflows</h1>
      <Filters />
      <WorkflowList workflows={workflows} />
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async req => {
  const { social_care_id, status, form_id, only_reviews_reassessments, sort } =
    req.query

  let orderBy: Prisma.WorkflowOrderByInput = { updatedAt: "desc" }
  if (sort === "recently-started") orderBy = { createdAt: "desc" }

  const workflows = await prisma.workflow.findMany({
    where: {
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
    },
    include: {
      creator: true,
      assignee: true,
      nextReview: true,
    },
    // put things that are in progress below the rest
    orderBy: [{ submittedAt: "asc" }, orderBy],
  })

  let resident = null
  if (social_care_id) {
    resident = await getResidentById(social_care_id as string)
  }

  return {
    props: {
      workflows: JSON.parse(
        JSON.stringify(
          workflows.map(workflow => ({
            ...workflow,
            form: forms.find(form => form.id === workflow.formId),
          }))
        )
      ),
      resident: JSON.parse(JSON.stringify(resident)),
    },
  }
}

export default IndexPage
