import { GetServerSideProps } from "next"
import ReviewOverviewLayout from "../../../../components/ReviewLayout"
import { AutosaveProvider } from "../../../../contexts/autosaveContext"
import { Status } from "../../../../types"
import { useRouter } from "next/router"
import { allSteps } from "../../../../config/forms"
import { getStatus } from "../../../../lib/status"
import prisma from "../../../../lib/prisma"
import { Prisma } from "@prisma/client"
import forms from "../../../../config/forms"

const workflowWithRelations = Prisma.validator<Prisma.WorkflowArgs>()({
  include: {
    creator: true,
    assignee: true,
    previousReview: true,
    // nextReview: true,
  },
})
type WorkflowWithRelations = Prisma.WorkflowGetPayload<
  typeof workflowWithRelations
>

const ReviewStepPage = (
  workflow: WorkflowWithRelations
): React.ReactElement => {
  const { query } = useRouter()

  const step = allSteps.find(step => step.id === query.stepId)

  return (
    <AutosaveProvider>
      <ReviewOverviewLayout workflow={workflow} step={step} />
    </AutosaveProvider>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const { id, stepId } = query

  const workflow = await prisma.workflow.findUnique({
    where: {
      id: id as string,
    },
    include: {
      previousReview: true,
    },
  })
  const form = forms.find(form => form.id === workflow.formId)

  // redirect if workflow doesn't exist
  if (!workflow || !form)
    return {
      props: {},
      redirect: {
        destination: "/404",
      },
    }

  // redirect if workflow is not in progress
  if (getStatus(workflow) !== Status.InProgress)
    return {
      props: {},
      redirect: {
        destination: `/workflow/${workflow.id}`,
      },
    }

  // redirect if workflow is not a review
  if (!workflow.workflowId)
    return {
      props: {},
      redirect: {
        destination: `/workflows/${workflow.id}/steps/${stepId}`,
      },
    }

  return {
    props: {
      ...JSON.parse(JSON.stringify(workflow)),
      form,
    },
  }
}

export default ReviewStepPage
