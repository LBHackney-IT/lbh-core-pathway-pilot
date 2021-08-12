import { WorkflowWithForm } from "../types"
import s from "./TaskList.module.scss"
import StepList from "./StepList"

interface Props {
  workflow: WorkflowWithForm
}

const TaskList = ({ workflow }: Props): React.ReactElement => {
  const completedSteps = Object.keys(workflow.answers)

  return (
    <ol className={s.taskList}>
      {workflow.form.themes.map((theme, i) => (
        <li key={theme.id} className={s.section}>
          <h2 className={s.sectionHeader}>
            {i + 1}. {theme.name}
          </h2>
          <StepList
            steps={theme.steps}
            completedSteps={completedSteps}
            workflow={workflow}
          />
        </li>
      ))}
    </ol>
  )
}

export default TaskList
