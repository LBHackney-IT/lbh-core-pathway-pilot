import Link from "next/link"
import AssigneeWidget from "../../../components/AssigneeWidget"
import Discard from "../../../components/Discard"
import Layout from "../../../components/_Layout"
import useResident from "../../../hooks/useResident"
import { getWorkflowWithRevisionsServerSide } from "../../../lib/serverSideProps"
import {
  FlexibleAnswers as FlexibleAnswersT,
  WorkflowWithCreatorAssigneeAndRevisions,
} from "../../../types"
import s from "../../../styles/RevisionHistory.module.scss"
import MilestoneTimeline from "../../../components/MilestoneTimeline"
import FlexibleAnswers from "../../../components/FlexibleAnswers/FlexibleAnswers"

const WorkflowPage = (
  workflow: WorkflowWithCreatorAssigneeAndRevisions
): React.ReactElement => {
  const { data: resident } = useResident(workflow.socialCareId)

  const title = resident
    ? `${resident.firstName} ${resident.lastName}`
    : "Workflow details"

  return (
    <Layout
      fullWidth
      title={title}
      breadcrumbs={[
        { href: "/", text: "Dashboard" },
        { text: "Workflow", current: true },
      ]}
    >
      <div className={`lbh-container lmf-full-width ${s.header}`}>
        <div>
          <h1 className="lbh-heading-h2 govuk-!-margin-bottom-3">{title}</h1>
          <AssigneeWidget workflowId={workflow.id} />
        </div>

        <div className={s.headerActions}>
          <Discard workflowId={workflow.id} />

          <Link href={`/workflows/${workflow.id}/steps`}>
            <a className="govuk-button lbh-button">Resume</a>
          </Link>
        </div>
      </div>

      <div className={s.splitPanes}>
        <aside className={s.sidebarPane}>
          <nav className={s.tabList}>
            <Link href={`/workflows/${workflow.id}/`}>
              <a className={s.tab} aria-selected={true}>
                Milestones
              </a>
            </Link>
            <Link href={`/workflows/${workflow.id}/revisions`}>
              <a className={s.tab}>Revisions</a>
            </Link>
          </nav>

          <div className={s.timelineWrapper}>
            <MilestoneTimeline workflow={workflow} />
          </div>
        </aside>

        <div className={s.mainPane}>
          {" "}
          <FlexibleAnswers answers={workflow.answers as FlexibleAnswersT} />
        </div>
      </div>
    </Layout>
  )
}

export const getServerSideProps = getWorkflowWithRevisionsServerSide

export default WorkflowPage
