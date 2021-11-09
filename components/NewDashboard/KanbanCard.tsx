import s from "./KanbanCard.module.scss"
import Link from "next/link"
import { Workflow } from ".prisma/client"
import { prettyDate } from "../../lib/formatters"
import { completeness } from "../../lib/taskList"

interface Props {
  workflow: Workflow
}

const KanbanCard = ({ workflow }: Props): React.ReactElement => (
  <li className={s.outer}>
    <Link href="#">
      <a className={s.link}>
        <h3 className={`lbh-heading-h5 govuk-!-margin-bottom-1 ${s.title}`}>
          Amy Rainbow
        </h3>
      </a>
    </Link>

    <p className={`lbh-body-xs govuk-!-margin-bottom-1 ${s.meta}`}>
      Started at {prettyDate(String(workflow.createdAt))}
    </p>

    <footer className={s.footer}>
      <span className={`lbh-body-xs ${s.completion}`}>
        {Math.floor(completeness(workflow) * 100)}% complete
      </span>

      {/* <span className={`lbh-body-xs ${s.overdue}`}>Overdue</span> */}

      <div className={s.assignmentCircle} title="Jaye Hackett">
        JH
      </div>
    </footer>

    <div
      className={s.completionBar}
      style={{ width: `${Math.floor(completeness(workflow) * 100)}%` }}
    ></div>
  </li>
)

export default KanbanCard
