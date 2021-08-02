import { Theme, WorkflowWithCreator } from "../types"
import { baseAssessment, assessmentElements, wrapUp } from "../config/forms"
import { Workflow } from "@prisma/client"
import Link from "next/link"
import s from "./TaskList.module.scss"
import { useMemo } from "react"

interface Props {
  workflow: WorkflowWithCreator
}

/** construct the right task list based on what assessment elements are included */
const buildThemes = (workflow: Workflow): Theme[] => {
  let themes = []
  themes.push(baseAssessment)
  assessmentElements.map(element => {
    if (workflow.assessmentElements.includes(element.id))
      themes = themes.concat(element.themes)
  })
  themes.push(wrapUp)
  return themes
}

const TaskList = ({ workflow }: Props): React.ReactElement => {
  const completedSteps = Object.keys(workflow.answers)
  const themes = useMemo(() => buildThemes(workflow), [])

  return (
    <ol className={s.taskList}>
      {themes.map((theme, i) => (
        <li key={theme.name}>
          <h2 className={s.section}>
            <span className={s.sectionNumber}>{i + 1}.</span> {theme.name}
          </h2>

          <ul className={s.items}>
            {theme.steps.map(step => (
              <li className={s.item} key={step.id}>
                <span className={s.taskName}>
                  <Link href={`/workflows/${workflow.id}/steps/${step.id}`}>
                    <a className="lbh-link">{step.name}</a>
                  </Link>
                </span>

                {completedSteps.includes(step.id) ? (
                  <strong
                    className={`govuk-tag lbh-tag--green app-task-list__tag ${s.tagDone}`}
                  >
                    Done
                  </strong>
                ) : (
                  <strong
                    className={`govuk-tag govuk-tag--grey app-task-list__tag ${s.tag}`}
                  >
                    To do
                  </strong>
                )}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  )
}

export default TaskList
