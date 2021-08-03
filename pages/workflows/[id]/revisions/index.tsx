import Link from "next/link"
import AssigneeWidget from "../../../../components/AssigneeWidget"
import Discard from "../../../../components/Discard"
import Layout from "../../../../components/_Layout"
import useResident from "../../../../hooks/useResident"
import { getWorkflowWithRevisionsServerSide } from "../../../../lib/serverSideProps"
import {
  WorkflowWithCreatorAssigneeAndRevisions,
  FlexibleAnswers as FlexibleAnswersT,
} from "../../../../types"
import s from "../../../../styles/RevisionHistory.module.scss"
import { prettyDateAndTime } from "../../../../lib/formatters"
import FlexibleAnswers from "../../../../components/FlexibleAnswers/FlexibleAnswers"

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
              <a className={s.tab}>Milestones</a>
            </Link>
            <Link href={`/workflows/${workflow.id}/revisions`}>
              <a className={s.tab} aria-selected={true}>
                Revisions
              </a>
            </Link>
          </nav>

          <Link href={`/workflows/${workflow.id}/revisions`}>
            <a className={s.revisionButton} aria-selected={true}>
              <span className={s.actor}>{workflow.updatedBy}</span>
              <span className={s.meta}>
                {prettyDateAndTime(String(workflow.updatedAt))} · Latest version
              </span>
            </a>
          </Link>

          {workflow.revisions.length > 0 ? (
            workflow.revisions.map(r => (
              <Link
                key={r.id}
                href={`/workflows/${workflow.id}/revisions/${r.id}`}
              >
                <a className={s.revisionButton}>
                  <span className={s.actor}>{r.actor.name}</span>
                  <span className={s.meta}>
                    {prettyDateAndTime(String(r.createdAt))}
                  </span>
                </a>
              </Link>
            ))
          ) : (
            <p>No revisions to show</p>
          )}
        </aside>

        <div className={s.mainPane}>
          <FlexibleAnswers answers={workflow.answers as FlexibleAnswersT} />
        </div>
      </div>
    </Layout>
  )
}

export const getServerSideProps = getWorkflowWithRevisionsServerSide

export default WorkflowPage
