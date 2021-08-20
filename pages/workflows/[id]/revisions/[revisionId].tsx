import Link from "next/link"
import { FlexibleAnswers as FlexibleAnswersT, Form } from "../../../../types"
import s from "../../../../styles/RevisionHistory.module.scss"
import { useRouter } from "next/router"
import FlexibleAnswers from "../../../../components/FlexibleAnswers/FlexibleAnswers"
import WorkflowOverviewLayout from "../../../../components/WorkflowOverviewLayout"
import RevisionList from "../../../../components/RevisionList"
import { GetServerSideProps } from "next"
import { Prisma } from "@prisma/client"
import prisma from "../../../../lib/prisma"

const workflowWithRelations = Prisma.validator<Prisma.WorkflowArgs>()({
  include: {
    creator: true,
    updater: true,
    nextReview: true,
    revisions: {
      include: {
        actor: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    },
  },
})
type WorkflowWithRelations = Prisma.WorkflowGetPayload<
  typeof workflowWithRelations
> & { form?: Form }

const WorkflowPage = (workflow: WorkflowWithRelations): React.ReactElement => {
  const { query } = useRouter()

  const revision = workflow?.revisions.find(
    revision => revision.id === query.revisionId
  )

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
      sidebar={
        <RevisionList workflow={workflow} selectedRevisionId={revision.id} />
      }
      mainContent={
        <FlexibleAnswers
          answers={revision.answers as FlexibleAnswersT}
          answersToCompare={workflow.answers as FlexibleAnswersT}
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
    include: {
      creator: true,
      updater: true,
      nextReview: true,
      revisions: {
        include: {
          actor: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
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
