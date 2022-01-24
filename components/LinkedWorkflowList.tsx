import { WorkflowType } from "@prisma/client"
import Link from "next/link"
import { Form } from "../types"
import EpisodeDialog from "./EpisodeDialog"
import s from "./LinkedWorkflowList.module.scss"
import { WorkflowForMilestoneTimeline } from "./MilestoneTimeline"

interface Props {
  workflow: WorkflowForMilestoneTimeline
  forms: Form[]
}

const prettyFormName = (forms, w) =>
  forms?.find(form => form.id === w.formId)?.name || w.formId

const LinkedWorkflowList = ({ workflow, forms }: Props): React.ReactElement => {
  if (workflow.nextWorkflows.length > 0)
    return (
      <ul className={`lbh-list ${s.box}`}>
        <li className="lbh-body-xs">Later workflows</li>
        <ul className="lbh-body-s">
          {workflow.nextWorkflows.map(w => (
            <li key={w.id}>
              <Link href={`/workflows/${w.id}`}>
                <a className="lbh-link lbh-link--no-visited-state">
                  {prettyFormName(forms, w)}
                </a>
              </Link>{" "}
              {w.type === WorkflowType.Reassessment && (
                <span className="lmf-grey">(reassessment)</span>
              )}
            </li>
          ))}
        </ul>

        {workflow.previousWorkflow && (
          <>
            <li className="lbh-body-xs">Parent workflow</li>

            <ul className="lbh-body-s">
              <li>
                <Link href={`/workflows/${workflow.previousWorkflow.id}`}>
                  <a className="lbh-link lbh-link--no-visited-state">
                    {prettyFormName(forms, workflow.previousWorkflow)}
                  </a>
                </Link>{" "}
                · <EpisodeDialog workflow={workflow} forms={forms} />
              </li>
            </ul>
          </>
        )}
      </ul>
    )

  return null
}

export default LinkedWorkflowList
