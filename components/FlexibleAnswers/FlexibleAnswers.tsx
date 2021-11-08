import {
  Step,
  StepAnswers,
  FlexibleAnswers as FlexibleAnswersT,
  RepeaterGroupAnswer as RepeaterGroupAnswerT,
  TimetableAnswer as TimetableAnswerT,
  Answer,
  Form,
} from "../../types"
import TimetableAnswer, { isTimetableAnswer } from "./TimetableAnswer"
import s from "./FlexibleAnswers.module.scss"
import useLocalStorage from "../../hooks/useLocalStorage"
import { diff } from "../../lib/revisions"
import { allStepsInForm } from "../../lib/taskList"
import SocialCareIdAnswer, {
  isSocialCareIdAnswer,
  providedSocialCareIdAnswer,
} from "./SocialCareIdAnswer"
import { getTotalHours } from "../../lib/forms"
import { prettyDate } from "../../lib/formatters"
import { isISODate } from "../../lib/date"

const shouldShow = (answerGroup: Answer): boolean => {
  if (Array.isArray(answerGroup)) {
    if (answerGroup.length > 0) return true
  } else if (isTimetableAnswer(answerGroup as TimetableAnswerT)) {
    if (
      getTotalHours(answerGroup as TimetableAnswerT) ||
      getTotalHours(answerGroup["timetable"] as TimetableAnswerT)
    )
      return true
  } else if (isSocialCareIdAnswer(answerGroup as RepeaterGroupAnswerT)) {
    if (Object.values(answerGroup).every(answer => answer !== "")) return true
  } else {
    if (answerGroup) return true
  }
  return false
}

const RepeaterGroupAnswer = ({
  answers,
}: {
  answers: RepeaterGroupAnswerT | TimetableAnswerT
}): React.ReactElement => (
  <ul className="govuk-list lbh-list">
    {Object.entries(answers).map(([questionName, answer]) => (
      <li key={questionName}>
        <strong
          dangerouslySetInnerHTML={{
            __html: `${questionName}:`,
          }}
        />{" "}
        {isSocialCareIdAnswer(answer) ? (
          <>
            {providedSocialCareIdAnswer(answer) ? (
              <>
                <a
                  href={`${process.env.NEXT_PUBLIC_SOCIAL_CARE_APP_URL}/people/${answer["Social care ID"]}`}
                >
                  {answer["Name"]}
                </a>{" "}
                (#{answer["Social care ID"]}, Born {answer["Date of birth"]})
              </>
            ) : (
              <span className={s.missing}>Not known</span>
            )}
          </>
        ) : Array.isArray(answer) ? (
          answer.join(", ")
        ) : (
          answer
        )}
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
      answers.map((item, i) =>
        typeof item === "string" ? (
          <li key={i}>{item}</li>
        ) : (
          <li key={i} className={s.repeaterAnswer}>
            <RepeaterGroupAnswer answers={item} />
          </li>
        )
      )}
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
            <dt
              className="govuk-summary-list__key"
              data-testid="question"
              dangerouslySetInnerHTML={{
                __html: questionName,
              }}
            />
            <dd className={`govuk-summary-list__value ${s.dd}`}>
              {typeof answerGroup === "string" ? (
                stepAnswersToCompare &&
                typeof stepAnswersToCompare[questionName] === "string" ? (
                  <span
                    dangerouslySetInnerHTML={{
                      __html: diff(
                        answerGroup,
                        stepAnswersToCompare[questionName] as string
                      ),
                    }}
                  />
                ) : isISODate(answerGroup) ? (
                  prettyDate(answerGroup)
                ) : (
                  answerGroup
                )
              ) : isSocialCareIdAnswer(answerGroup as RepeaterGroupAnswerT) ? (
                <SocialCareIdAnswer
                  answer={answerGroup as RepeaterGroupAnswerT}
                />
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
  formStep,
  stepName,
  stepAnswers,
  stepAnswersToCompare,
  forceOpen,
}: {
  formStep?: Step
  stepName: string
  stepAnswers: StepAnswers
  stepAnswersToCompare?: StepAnswers
  forceOpen?: boolean
}): React.ReactElement => {
  const [open, setOpen] = useLocalStorage<boolean>(stepName, true)

  let sortedStepAnswers = stepAnswers

  if (formStep) {
    const fieldsToSortBy = formStep.fields
      .map(field => {
        if (field.subfields) {
          return field.subfields.map(subfield => `${field.id}.${subfield.id}`)
        }
        return field.id
      })
      .flat()

    const sortRepeaterGroupAnswers = (repeaterGroupAnswers, fieldId) =>
      repeaterGroupAnswers.map(repeaterGroupAnswer =>
        Object.fromEntries(
          Object.entries(repeaterGroupAnswer).sort(
            (c, d) =>
              fieldsToSortBy.indexOf(`${fieldId}.${c[0]}`) -
              fieldsToSortBy.indexOf(`${fieldId}.${d[0]}`)
          )
        )
      )

    sortedStepAnswers = Object.fromEntries(
      Object.entries(sortedStepAnswers).map(([question, answer]) => {
        if (Array.isArray(answer) && typeof answer[0] === "object") {
          return [question, sortRepeaterGroupAnswers(answer, question)]
        } else {
          return [question, answer]
        }
      })
    )

    sortedStepAnswers = Object.fromEntries(
      Object.entries(sortedStepAnswers).sort(
        (a, b) => fieldsToSortBy.indexOf(a[0]) - fieldsToSortBy.indexOf(b[0])
      )
    )
  }

  if (forceOpen)
    return (
      <section
        key={stepName}
        className="lbh-collapsible govuk-!-margin-bottom-8"
      >
        <div className="lbh-collapsible__button">
          <h2 className="lbh-heading-h3 lbh-collapsible__heading">
            {stepName}
          </h2>
        </div>

        <div className="lbh-collapsible__content">
          <SummaryList
            stepAnswers={sortedStepAnswers}
            stepAnswersToCompare={stepAnswersToCompare}
          />
        </div>
      </section>
    )

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
            stepAnswers={sortedStepAnswers}
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
  form?: Form
  forceOpen?: boolean
}

const FlexibleAnswers = ({
  answers,
  answersToCompare,
  form,
  forceOpen,
}: Props): React.ReactElement => {
  let steps = Object.entries(answers)

  const formSteps = allStepsInForm(form)

  // enforce the correct sort order on steps
  if (formSteps) {
    const stepsToSortBy = formSteps.map(step => step.id)

    steps = steps.sort(
      (a, b) => stepsToSortBy.indexOf(a[0]) - stepsToSortBy.indexOf(b[0])
    )
  }

  if (Object.keys(answers).length > 0)
    return (
      <>
        {steps.map(([stepName, stepAnswers]) => (
          <FlexibleAnswersStep
            key={stepName}
            formStep={formSteps?.find(formStep => formStep.id === stepName)}
            stepName={stepName}
            stepAnswers={stepAnswers}
            stepAnswersToCompare={answersToCompare?.[stepName]}
            forceOpen={forceOpen}
          />
        ))}
      </>
    )

  return <p className={s.noResults}>No answers to show</p>
}

export default FlexibleAnswers
