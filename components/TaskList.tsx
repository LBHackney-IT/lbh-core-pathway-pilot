import { ReviewWithCreatorAndAssignee } from "../types"
import s from "./TaskList.module.scss"
import { useCallback, useEffect, useState } from "react"
import { allStepsInElement } from "../lib/taskList"
import PageAnnouncement from "./PageAnnouncement"
import { assessmentElements, baseAssessment, wrapUp } from "../config/forms"
import StepList from "./StepList"

const CollapsibleElement = ({
  element,
  addElement,
  removeElement,
  workflow,
  completedSteps,
  active,
  i,
}) => {
  const steps = allStepsInElement(element)

  if (active) {
    return (
      <li key={element.id} className={s.section}>
        <h2 className={s.sectionHeader}>
          {i}. {element.name}
          <button
            aria-expanded={true}
            className="lbh-link"
            onClick={() => removeElement(element.id)}
          >
            Remove
          </button>
        </h2>
        <StepList
          steps={steps}
          completedSteps={completedSteps}
          workflow={workflow}
        />
      </li>
    )
  }

  return (
    <li key={element.id} className={s.closedSection}>
      <button aria-expanded={false} onClick={() => addElement(element.id)}>
        Add {element.name}?
      </button>
    </li>
  )
}

interface Props {
  workflow: ReviewWithCreatorAndAssignee
}

const TaskList = ({ workflow }: Props): React.ReactElement => {
  const completedSteps = Object.keys(workflow.answers)

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
        setStatus(e.toString())
      }
    },
    [workflow.id]
  )

  const addElement = id => setActiveElements(activeElements.concat(id))

  const removeElement = id =>
    setActiveElements(activeElements.filter(element => element !== id))

  useEffect(() => {
    handleUpdate(activeElements)
  }, [activeElements, handleUpdate])

  let dynamicIndex = 0

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
        {baseAssessment.themes.map((theme, i) => (
          <li key={theme.id} className={s.section}>
            <h2 className={s.sectionHeader}>
              {i + 1}. {theme.name}
            </h2>
            <StepList
              steps={theme.steps}
              completedSteps={completedSteps}
              workflow={workflow}
            />
          </li>
        ))}

        {assessmentElements.map(element => (
          <CollapsibleElement
            key={element.id}
            element={element}
            workflow={workflow}
            active={activeElements.includes(element.id)}
            addElement={addElement}
            removeElement={removeElement}
            completedSteps={completedSteps}
            i={
              baseAssessment.themes.length +
              (activeElements.includes(element.id)
                ? dynamicIndex++
                : dynamicIndex)
            }
          />
        ))}

        {wrapUp.themes.map((theme, i) => (
          <li key={theme.id} className={s.section}>
            <h2 className={s.sectionHeader}>
              {i + 1 + baseAssessment.themes.length + activeElements.length}.{" "}
              {theme.name}
            </h2>
            <StepList
              steps={theme.steps}
              completedSteps={completedSteps}
              workflow={workflow}
            />
          </li>
        ))}
      </ol>
    </>
  )
}

export default TaskList
