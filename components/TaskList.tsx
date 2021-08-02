import { WorkflowWithCreator } from "../types"
import { baseAssessment, assessmentElements, wrapUp } from "../config/forms"
import { Theme } from "pretty-format"
import { Workflow } from "@prisma/client"

interface Props {
  workflow: WorkflowWithCreator
}

const buildThemes = (workflow: Workflow): Theme[] => {
  const themes = []
  themes.push(baseAssessment)
  assessmentElements.map(element => {
    if (workflow.assessmentElements.includes(element.id))
      themes.push(element.themes)
  })
  themes.push(wrapUp)
  return themes
}

const TaskList = ({ workflow }: Props): React.ReactElement => {
  const completedSteps = Object.keys(workflow.answers)
  const steps = buildThemes(workflow)

  return <h1>foo</h1>
}

export default TaskList
