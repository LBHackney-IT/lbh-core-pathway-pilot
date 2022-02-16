import {Workflow} from "@prisma/client";
import {prettyDate} from "./formatters";
import { Form } from "../types"

export const getLinkableWorkflows = (workflows: Workflow[], forms: Form[], currentWorkflowId?: string): { value: string, label: string }[] => {
  return [
    {
      value: "",
      label: "None",
    },
  ].concat(
    workflows
      ?.filter(linkableWorkflow => linkableWorkflow.id != currentWorkflowId || "")
      .map(linkableWorkflow => ({
        label: `${
          forms?.find(form => form.id === linkableWorkflow.formId)?.name ||
          linkableWorkflow.formId
        } (last edited ${prettyDate(String(linkableWorkflow.updatedAt || linkableWorkflow.createdAt))})`,
        value: linkableWorkflow.id,
      })) || []
  )
}