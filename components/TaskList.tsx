import { ReviewWithCreatorAndAssignee } from "../types"
import Link from "next/link"
import s from "./TaskList.module.scss"
import { useCallback, useEffect, useMemo, useState } from "react"
import { allThemes } from "../lib/taskList"
import PageAnnouncement from "./PageAnnouncement"
import { assessmentElements } from "../config/forms"

interface Props {
  workflow: ReviewWithCreatorAndAssignee
}

const TaskList = ({ workflow }: Props): React.ReactElement => {
  const completedSteps = Object.keys(workflow.answers)
  const themes = useMemo(() => allThemes(), [])

  const [status, setStatus] = useState<string | false>(false)
  const [activeElements, setActiveElements] = useState<string[]>(
    workflow.assessmentElements
  )

  const handleUpdate = useCallback(
    async (activeElements: string[]) => {
      try {
        const res = await fetch(`/api/workflows/${workflow.id}`, {
          body: JSON.stringify({
            assessmentElements: activeElements,
          }),
          method: "PATCH",
        })
        const data = await res.json()
        if (data.error) throw data.error
      } catch (e) {
        console.log(e)
        setStatus(e.toString())
      }
    },
    [workflow.id]
  )

  const addElement = id => setActiveElements(activeElements.concat[id])

  const removeElement = id =>
    setActiveElements(activeElements.filter(element => element !== id))

  useEffect(() => {
    // update active elements on the api
    handleUpdate(activeElements)
  }, [activeElements, handleUpdate])

  return (
    <>
      {status && (
        <PageAnnouncement
          className="lbh-page-announcement--warning"
          title="There was a problem submitting your answers"
        >
          <p>Refresh the page or try again later.</p>
          <p className="lbh-body-xs">{status}</p>
        </PageAnnouncement>
      )}

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
                    <Link
                      href={
                        workflow.reviewOf
                          ? `/reviews/${workflow.id}/steps/${step.id}`
                          : `/workflows/${workflow.id}/steps/${step.id}`
                      }
                    >
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
    </>
  )
}

export default TaskList
