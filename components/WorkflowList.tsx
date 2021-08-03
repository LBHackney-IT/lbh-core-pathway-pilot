import WorkflowPanel from "../components/WorkflowPanel"
import { WorkflowWithCreatorAndAssignee } from "../types"
import s from "./WorkflowList.module.scss"

interface Props {
  workflows: WorkflowWithCreatorAndAssignee[]
}

const WorkflowList = ({ workflows }: Props): React.ReactElement => (
  <div className={s.outer}>
    <p className={s.resultCount}>Showing {workflows.length} results</p>
    {workflows.length > 0 ? (
      workflows.map(workflow => (
        <WorkflowPanel key={workflow.id} workflow={workflow} />
      ))
    ) : (
      <p>No results to show</p>
    )}
  </div>
)

export default WorkflowList
