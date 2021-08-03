import useQueryState from "../hooks/useQueryState"
import useQuery from "../hooks/useQueryState"
import { prettyDateAndTime } from "../lib/formatters"
import s from "../styles/RevisionHistory.module.scss"
import { WorkflowWithCreatorAssigneeAndRevisions } from "../types"

interface Props {
  workflow: WorkflowWithCreatorAssigneeAndRevisions
}

const RevisionSummary = ({ workflow }: Props): React.ReactElement => {
  const [selectedRevisionId, setSelectedRevisionId] = useQuery(
    "selected_revision",
    workflow?.revisions?.[0]?.id || null
  )
  const [activeTab, setActiveTab] = useQueryState("active_tab", "revisions")

  const selectedRevision = workflow.revisions.find(
    revision => revision.id === selectedRevisionId
  )
  return (
    <div className={s.splitPanes}>
      <aside className={s.sidebarPane}>
        <button onClick={() => setActiveTab("revisions")}>Revisions</button>
        <button onClick={() => setActiveTab("timeline")}>Timeline</button>

        {activeTab === "revisions" ? (
          workflow.revisions.map(revision => (
            <button
              key={revision.id}
              onClick={() => setSelectedRevisionId(revision.id)}
            >
              Edited {prettyDateAndTime(String(revision.createdAt))} by{" "}
              {revision.actor.name}
            </button>
          ))
        ) : (
          <p>
            Started {prettyDateAndTime(String(workflow.createdAt))} by{" "}
            {workflow.creator.name}
          </p>
        )}
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
