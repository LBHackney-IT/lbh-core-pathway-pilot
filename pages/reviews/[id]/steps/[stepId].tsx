import { GetServerSideProps } from "next"
import ReviewOverviewLayout from "../../../../components/ReviewLayout"
import { AutosaveProvider } from "../../../../contexts/autosaveContext"
import { Form, Status, Step } from "../../../../types"
import { useRouter } from "next/router"
import { allSteps as allStepsConfig } from "../../../../config/forms"
import { getStatus } from "../../../../lib/status"
import prisma from "../../../../lib/prisma"
import { Prisma } from "@prisma/client"
import forms from "../../../../config/forms"
import {protectRoute} from "../../../../lib/protectRoute";

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
> & { form?: Form }

interface Props {
  workflow: WorkflowWithRelations
  allSteps: Step[]
}

const ReviewStepPage = ({ workflow, allSteps }: Props): React.ReactElement => {
  const { query } = useRouter()

  const step = allSteps.find(step => step.id === query.stepId)

  return (
    <AutosaveProvider>
      <ReviewOverviewLayout workflow={workflow} step={step} />
    </AutosaveProvider>
  )
}

export const getServerSideProps: GetServerSideProps = protectRoute(async ({ query }) => {
  const { id, stepId } = query

  const workflow = await prisma.workflow.findUnique({
    where: {
      id: id as string,
    },
    include: {
      previousReview: true,
    },
  })
  const form = (await forms()).find(form => form.id === workflow.formId)

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
        destination: `/workflows/${workflow.id}`,
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
      workflow: { ...JSON.parse(JSON.stringify(workflow)), form },
      allSteps: await allStepsConfig(),
    },
  }
})

export default ReviewStepPage
