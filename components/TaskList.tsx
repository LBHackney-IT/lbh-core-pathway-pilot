import s from "./TaskList.module.scss"
import StepList from "./StepList"
import { Form, Theme } from "../types"
import { Workflow } from "@prisma/client"

interface Props {
  workflow: Workflow & { form: Form }
}

export const retrieveFilterThemes = ({ workflow }: Props): Theme[] => {
  let filteredThemes
  if (process.env.NODE_ENV === "production") {
    filteredThemes = workflow.form.themes
  } else {
    filteredThemes = workflow.form.themes.filter(theme =>
      theme.typeFilter ? theme.typeFilter.includes(workflow.type) : false
    )
  }
  return filteredThemes
}

const TaskList = ({ workflow }: Props): React.ReactElement => {
  const completedSteps = Object.keys(workflow.answers)

  const display = retrieveFilterThemes({ workflow })

  return (
    <ol className={s.taskList}>
      {display.map((theme, i) => (
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
