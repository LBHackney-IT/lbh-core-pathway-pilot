import { Workflow, Team } from "@prisma/client"
import { Form } from "../types"

/** a filtered list of workflows for a particular team, for building a team backlog/worktray */
export const filterWorkflowsForTeam = (
  workflows: Workflow[],
  team: Team,
  forms: Form[]
): Workflow[] =>
  workflows.filter(workflow =>
    forms.find(form => workflow.formId === form.id)?.teams?.includes(team)
  )
