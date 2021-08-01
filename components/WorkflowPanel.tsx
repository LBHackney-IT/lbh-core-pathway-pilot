import { Prisma } from "@prisma/client"
import Link from "next/link"
import s from "./WorkflowPanel.module.scss"

const workflowWithCreator = Prisma.validator<Prisma.WorkflowArgs>()({
  include: { creator: true },
})

type WorkflowWithCreator = Prisma.WorkflowGetPayload<typeof workflowWithCreator>

interface Props {
  workflow: WorkflowWithCreator
}

const WorkflowPanel = ({ workflow }: Props): React.ReactElement => {
  return (
    <div className={s.outer}>
      <div className={s.person}>
        <h3>{workflow.socialCareId}</h3>
        <p className={s.meta}>
          Started by {workflow?.creator.name} ·{" "}
          <Link href={`/workflows/${workflow.id}`}>
            <a className="lbh-link lbh-link--muted">Details</a>
          </Link>
        </p>
      </div>

      <dl className={s.stats}>
        <div>
          <dd>XX%</dd>
          <dt>complete</dt>
        </div>
        <div>
          <dd>XX</dd>
          <dt>current step</dt>
        </div>
      </dl>

      <Link href={`/workflows/${workflow.id}/steps`}>
        <a className="govuk-button lbh-button">Resume</a>
      </Link>

      <div className={s.meter} aria-hidden="true" data-completion={2}>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  )
}

export default WorkflowPanel
