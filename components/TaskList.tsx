import s from "./TaskList.module.scss"
import StepList from "./StepList"
import { Form, Theme } from "../types"
import { Prisma, Workflow } from "@prisma/client"

interface Props {
  workflow: Workflow & { form: Form }
}

const workflowForFilter = Prisma.validator<Prisma.WorkflowArgs>()({
  select: {
    type: true,
  },
})
export type WorkflowForFilter = Prisma.WorkflowGetPayload<
  typeof workflowForFilter
>

export const retrieveFilterThemes = (
  workflow: WorkflowForFilter & { form?: Form }
): Theme[] => {
  let filteredThemes
  if (workflow?.form?.themes) {
    // if (process.env.NODE_ENV === "production") {
    //   filteredThemes = workflow.form.themes
    // } else {
      filteredThemes = workflow.form.themes.filter(theme =>
        theme.typeFilter ? theme.typeFilter.includes(workflow.type) : false
      )
    // }
    return filteredThemes
  } else {
    return []
  }
}

const TaskList = ({ workflow }: Props): React.ReactElement => {
  const completedSteps = Object.keys(workflow.answers)

  const display = retrieveFilterThemes(workflow)

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
