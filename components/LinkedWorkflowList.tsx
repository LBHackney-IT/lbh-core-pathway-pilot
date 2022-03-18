import { WorkflowType } from "@prisma/client"
import Link from "next/link"
import { prettyFormName } from "../lib/formatters"
import { Form } from "../types"
import EpisodeDialog from "./EpisodeDialog"
import s from "./LinkedWorkflowList.module.scss"
import { WorkflowForMilestoneTimeline } from "./MilestoneTimeline"

interface Props {
  workflow: WorkflowForMilestoneTimeline
  forms: Form[]
}

const LinkedWorkflowList = ({workflow, forms}: Props): React.ReactElement => {
  if (workflow.nextWorkflows.length === 0 && !workflow.previousWorkflow) return null;

  return (
    <>
      <ul className={`lbh-list ${s.box}`}>

        {workflow.nextWorkflows.length > 0 && (
          <>
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
                  {w.type === WorkflowType.Review && (
                    <span className="lmf-grey">(review)</span>
                  )}                  
                </li>
              ))}
            </ul>
          </>
        )}


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
                · <EpisodeDialog workflow={workflow} forms={forms}/>
              </li>
            </ul>
          </>
        )}

      </ul>
    </>
  )
};

export default LinkedWorkflowList
