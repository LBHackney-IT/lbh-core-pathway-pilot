import {
  StepAnswers,
  FlexibleAnswers as FlexibleAnswersT,
  RepeaterGroupAnswer as RepeaterGroupAnswerT,
  TimetableAnswer as TimetableAnswerT,
  Answer,
} from "../../types"
import TimetableAnswer, { isTimetableAnswer } from "./TimetableAnswer"
import s from "./FlexibleAnswers.module.scss"
import useLocalStorage from "../../hooks/useLocalStorage"
import { diffWords } from "diff"

const diff = (answer, answerToCompare) => {
  let result = ""

  diffWords(answer, answerToCompare).forEach(part => {
    if (part.added) {
      result += `<ins role="insertion">${part.value}</ins>`
    } else if (part.removed) {
      result += `<del role="deletion">${part.value}</del>`
    } else {
      result += part.value
    }
  })
  return result
}

const shouldShow = (answerGroup: Answer): boolean => {
  if (Array.isArray(answerGroup)) {
    if (answerGroup.length > 0) return true
  } else {
    if (answerGroup) return true
  }
  return false
}

const RepeaterGroupAnswer = ({
  answers,
}: {
  answers: RepeaterGroupAnswerT
}): React.ReactElement => (
  <ul className="govuk-list lbh-list">
    {Object.entries(answers).map(([questionName, answer]) => (
      <li key={questionName}>
        <strong>{questionName}:</strong>{" "}
        {Array.isArray(answer) ? answer.join(", ") : answer}
      </li>
    ))}
  </ul>
)

const RepeaterGroupAnswers = ({
  answers,
}: {
  answers: (string | RepeaterGroupAnswerT)[]
}): React.ReactElement => (
  <ul className="govuk-list lbh-list">
    {answers.length > 0 &&
      answers.map((item, i) => (
        <li key={i}>
          {typeof item === "string" ? (
            item
          ) : (
            <RepeaterGroupAnswer answers={item} />
          )}
        </li>
      ))}
  </ul>
)

const SummaryList = ({
  stepAnswers,
  stepAnswersToCompare,
}: {
  stepAnswers: StepAnswers
  stepAnswersToCompare?: StepAnswers
}): React.ReactElement => (
  <dl className="govuk-summary-list lbh-summary-list">
    {Object.entries(stepAnswers).map(
      ([questionName, answerGroup]) =>
        shouldShow(answerGroup) && (
          <div className="govuk-summary-list__row" key={questionName}>
            <dt className="govuk-summary-list__key">{questionName}</dt>
            <dd className={`govuk-summary-list__value ${s.dd}`}>
              {typeof answerGroup === "string" ? (
                stepAnswersToCompare ? (
                  <span
                    dangerouslySetInnerHTML={{
                      __html: diff(
                        answerGroup,
                        stepAnswersToCompare[questionName]
                      ),
                    }}
                  />
                ) : (
                  answerGroup
                )
              ) : isTimetableAnswer(
                  answerGroup as TimetableAnswerT | RepeaterGroupAnswerT[]
                ) ? (
                <TimetableAnswer answers={answerGroup as TimetableAnswerT} />
              ) : (
                <RepeaterGroupAnswers
                  answers={answerGroup as RepeaterGroupAnswerT[]}
                />
              )}
            </dd>
          </div>
        )
    )}
  </dl>
)

const FlexibleAnswersStep = ({
  stepName,
  stepAnswers,
  stepAnswersToCompare,
}: {
  stepName: string
  stepAnswers: StepAnswers
  stepAnswersToCompare?: StepAnswers
}): React.ReactElement => {
  const [open, setOpen] = useLocalStorage<boolean>(stepName, true)

  return (
    <section key={stepName} className="lbh-collapsible govuk-!-margin-bottom-8">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="lbh-collapsible__button"
      >
        <h2 className="lbh-heading-h3 lbh-collapsible__heading">{stepName}</h2>
        <svg
          className="down-arrow-icon"
          xmlns="http://www.w3.org/2000/svg"
          x="0px"
          y="0px"
          width="284.929px"
          height="284.929px"
          viewBox="0 0 284.929 284.929"
        >
          <g>
            <path
              fill="#0B0C0C"
              d="M282.082,76.511l-14.274-14.273c-1.902-1.906-4.093-2.856-6.57-2.856c-2.471,0-4.661,0.95-6.563,2.856L142.466,174.441
		L30.262,62.241c-1.903-1.906-4.093-2.856-6.567-2.856c-2.475,0-4.665,0.95-6.567,2.856L2.856,76.515C0.95,78.417,0,80.607,0,83.082
		c0,2.473,0.953,4.663,2.856,6.565l133.043,133.046c1.902,1.903,4.093,2.854,6.567,2.854s4.661-0.951,6.562-2.854L282.082,89.647
		c1.902-1.903,2.847-4.093,2.847-6.565C284.929,80.607,283.984,78.417,282.082,76.511z"
            />
          </g>
        </svg>
      </button>

      {open && (
        <div className="lbh-collapsible__content">
          <SummaryList
            stepAnswers={stepAnswers}
            stepAnswersToCompare={stepAnswersToCompare}
          />
        </div>
      )}
    </section>
  )
}

interface Props {
  answers: FlexibleAnswersT
  answersToCompare?: FlexibleAnswersT
}

const FlexibleAnswers = ({
  answers,
  answersToCompare,
}: Props): React.ReactElement => {
  const steps = Object.entries(answers)

  if (Object.keys(answers).length > 0)
    return (
      <div>
        {steps.map(([stepName, stepAnswers]) => (
          <FlexibleAnswersStep
            key={stepName}
            stepName={stepName}
            stepAnswers={stepAnswers}
            stepAnswersToCompare={answersToCompare?.[stepName]}
          />
        ))}
      </div>
    )

  return <p className={s.noResults}>No answers to show</p>
}

export default FlexibleAnswers
