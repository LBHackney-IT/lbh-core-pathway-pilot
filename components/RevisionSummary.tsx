import useQueryState from "../hooks/useQueryState"
import useQuery from "../hooks/useQueryState"
import { prettyDateAndTime } from "../lib/formatters"
import s from "../styles/RevisionHistory.module.scss"
import { WorkflowWithCreatorAssigneeAndRevisions } from "../types"
import MilestoneTimeline from "./MilestoneTimeline"

interface Props {
  workflow: WorkflowWithCreatorAssigneeAndRevisions
}

const Tab = ({ activeTab, setActiveTab, value, children }) => (
  <button
    role="tab"
    onClick={() => setActiveTab(value)}
    className={s.tab}
    aria-selected={activeTab === value}
  >
    {children}
  </button>
)

const RevisionSummary = ({ workflow }: Props): React.ReactElement => {
  const [selectedRevisionId, setSelectedRevisionId] = useQuery(
    "selected_revision",
    workflow?.revisions?.[0]?.id || null
  )
  const [activeTab, setActiveTab] = useQueryState("active_tab", "timeline")

  const selectedRevision = workflow.revisions.find(
    revision => revision.id === selectedRevisionId
  )
  return (
    <div className={s.splitPanes}>
      <aside className={s.sidebarPane}>
        <nav role="tablist" className={s.tabList}>
          <Tab
            value="milestones"
            setActiveTab={setActiveTab}
            activeTab={activeTab}
          >
            Milestones
          </Tab>
          <Tab
            value="revisions"
            setActiveTab={setActiveTab}
            activeTab={activeTab}
          >
            Revisions
          </Tab>
        </nav>

        <div role="tabpanel" className={s.tabPanel}>
          {activeTab === "revisions" ? (
            workflow.revisions.length > 0 ? (
              workflow.revisions.map(revision => (
                <button
                  className={s.revisionButton}
                  key={revision.id}
                  onClick={() => setSelectedRevisionId(revision.id)}
                  aria-selected={selectedRevisionId === revision.id}
                >
                  <span className={s.actor}>{revision.actor.name}</span>
                  <span className={s.meta}>
                    {prettyDateAndTime(String(revision.createdAt))}
                  </span>
                </button>
              ))
            ) : (
              <p>No revisions to show</p>
            )
          ) : (
            <div className={s.timelineWrapper}>
              <MilestoneTimeline workflow={workflow} />
            </div>
          )}
        </div>
      </aside>

      <div className={s.mainPane}>
        {selectedRevision ? (
          <>
            <p>
              This edit by {selectedRevision.actor.name} on{" "}
              {prettyDateAndTime(String(selectedRevision.createdAt))}
            </p>
            {JSON.stringify(selectedRevision)}
          </>
        ) : (
          <p className={s.notStarted}>Not started yet</p>
        )}
      </div>
    </div>
  )
}

export default RevisionSummary
