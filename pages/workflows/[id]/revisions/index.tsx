import Link from "next/link"
import { FlexibleAnswers as FlexibleAnswersT, Form } from "../../../../types"
import s from "../../../../styles/RevisionHistory.module.scss"
import FlexibleAnswers from "../../../../components/FlexibleAnswers/FlexibleAnswers"
import WorkflowOverviewLayout from "../../../../components/WorkflowOverviewLayout"
import RevisionList from "../../../../components/RevisionList"
import { GetServerSideProps } from "next"
import prisma from "../../../../lib/prisma"
import { Prisma } from "@prisma/client"

const include: Prisma.WorkflowInclude = {
  creator: true,
  updater: true,
  nextReview: true,
  revisions: {
    include: {
      actor: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  },
}

const workflowWithRelations = Prisma.validator<Prisma.WorkflowArgs>()({
  include,
})
export type WorkflowWithRelations = Prisma.WorkflowGetPayload<
  typeof workflowWithRelations
> & { form?: Form }

const WorkflowPage = (workflow: WorkflowWithRelations): React.ReactElement => {
  return (
    <WorkflowOverviewLayout
      workflow={workflow}
      nav={
        <ul>
          <li className={s.tab}>
            <Link scroll={false} href={`/workflows/${workflow.id}/`}>
              Milestones
            </Link>
          </li>
          <li className={s.tab} aria-current={true}>
            Revisions
          </li>
        </ul>
      }
      sidebar={<RevisionList workflow={workflow} />}
      mainContent={
        <FlexibleAnswers
          answers={workflow.answers as FlexibleAnswersT}
          form={workflow.form}
        />
      }
    />
  )
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const { id } = query

  const workflow = await prisma.workflow.findUnique({
    where: {
      id: id as string,
    },
    include,
  })

  // redirect if workflow doesn't exist
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

export default WorkflowPage
