import { Workflow, Team } from "@prisma/client"
import forms from "../config/forms"

/** a filtered list of workflows for a particular team, for building a team backlog/worktray */
export const filterWorkflowsForTeam = (
  workflows: Workflow[],
  team: Team
): Workflow[] =>
  workflows.filter(workflow => {
    console.log(forms)

    return forms
      .find(form => workflow.formId === form.id)
      ?.teams?.includes(team)
  })
