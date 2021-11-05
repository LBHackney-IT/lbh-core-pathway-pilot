import Link from "next/link"
import { FlexibleAnswers as FlexibleAnswersT, Form } from "../../../../types"
import s from "../../../../styles/LeftSidebar.module.scss"
import FlexibleAnswers from "../../../../components/FlexibleAnswers/FlexibleAnswers"
import WorkflowOverviewLayout from "../../../../components/WorkflowOverviewLayout"
import RevisionList from "../../../../components/RevisionList"
import { GetServerSideProps } from "next"
import prisma from "../../../../lib/prisma"
import { Prisma } from "@prisma/client"
import forms from "../../../../config/forms"
import { protectRoute } from "../../../../lib/protectRoute"

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
        createdAt: "desc",
      },
    },
  },
})
type WorkflowWithRelations = Prisma.WorkflowGetPayload<
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
        <>
          <p className="lbh-body-s govuk-!-margin-bottom-6 lmf-grey">
            Next steps and resident details are not included in revisions.
          </p>
          <FlexibleAnswers
            answers={workflow.answers as FlexibleAnswersT}
            form={workflow?.form}
          />
        </>
      }
    />
  )
}

export const getServerSideProps: GetServerSideProps = protectRoute(
  async ({ query }) => {
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
          // where: {
          //   action: "Edited",
          // },
          include: {
            actor: true,
          },
          orderBy: {
            createdAt: "desc",
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

    const resolvedForms = await forms()

    return {
      props: {
        ...JSON.parse(
          JSON.stringify({
            ...workflow,
            form: resolvedForms.find(form => form.id === workflow.formId),
          })
        ),
      },
    }
  }
)

export default WorkflowPage
