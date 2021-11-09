import s from "./KanbanCard.module.scss"
import Link from "next/link"

const KanbanCard = (): React.ReactElement => (
  <li className={s.outer}>
    <Link href="#">
      <a className={s.link}>
        <h3 className={`lbh-heading-h5 govuk-!-margin-bottom-1 ${s.title}`}>
          Amy Rainbow
        </h3>
      </a>
    </Link>

    <p className={`lbh-body-xs govuk-!-margin-bottom-1 ${s.meta}`}>
      Started at X
    </p>

    <footer className={s.footer}>
      <span className={`lbh-body-xs ${s.completion}`}>95% complete</span>
      <div className={s.assignmentCircle} title="Jaye Hackett">
        JH
      </div>
    </footer>
  </li>
)

export default KanbanCard
