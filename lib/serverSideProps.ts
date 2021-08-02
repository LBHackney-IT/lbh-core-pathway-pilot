import { GetServerSideProps } from "next"
import prisma from "./prisma"
import { getResidentById } from "./residents"

export const getResidentServerSide: GetServerSideProps = async ({ query }) => {
  const { social_care_id } = query

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

export const getWorkflowsServerSide: GetServerSideProps = async () => {
  const workflows = await prisma.workflow.findMany({
    where: {
      discardedAt: null,
    },
    include: {
      creator: true,
    },
  })

  return {
    props: {
      workflows: JSON.parse(JSON.stringify(workflows)),
    },
  }
}

export const getWorkflowServerSide: GetServerSideProps = async ({ params }) => {
  const { id } = params

  const workflow = await prisma.workflow.findUnique({
    where: { id: id as string },
  })

  return {
    props: {
      ...JSON.parse(JSON.stringify(workflow)),
    },
  }
}
