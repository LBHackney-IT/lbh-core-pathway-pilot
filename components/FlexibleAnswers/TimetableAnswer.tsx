import {
  TimetableAnswer as TimetableAnswerT,
  RepeaterGroupAnswer,
} from "../../types"
import { days, times } from "../../lib/forms"
import s from "./FlexibleAnswers.module.scss"
import { costPerHour } from "../../config"

/** test if the answer group has any keys from the list of days. if so, it's probably timetable data */
export const isTimetableAnswer = (
  answerGroup: RepeaterGroupAnswer[] | TimetableAnswerT
): boolean => {
  const isTimetable = answers =>
    Object.keys(days).some(day => Object.keys(answers).includes(day))

  const isOldStructure = isTimetable(answerGroup)
  const isNewStructure =
    Object.keys(answerGroup).includes("timetable") &&
    isTimetable(answerGroup["timetable"])

  return isOldStructure || isNewStructure
}

const TimetableAnswer = ({
  answers,
}: {
  answers: TimetableAnswerT
}): React.ReactElement => {
  const timetable = Object.keys(answers).includes("timetable")
    ? answers?.timetable
    : answers
  const summary = answers?.summary

  return (
    <>
      <table className={`lbh-body-s ${s.timetable}`}>
        <thead>
          <tr>
            <td></td>
            {times.map(time => (
              <th scope="col" key={time}>
                {time}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.keys(days).map(shortDay => (
            <tr key={shortDay}>
              <td scope="row">{shortDay}</td>
              {times.map(time => (
                <td key={time}>{timetable?.[shortDay]?.[time]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {summary && (
        <>
          <p className="govuk-!-margin-top-4 lbh-body-s">
            {summary["total hours"] || "0"}{" "}
            {summary["total hours"] === "1" ? "hour" : "hours"} total
          </p>
          <p className="govuk-!-margin-top-2 lbh-body-s">
            {summary["annual cost"] || 0} estimated annual cost (or{" "}
            {summary["weekly cost"]} weekly, at the average brokerage rate of £
            {costPerHour}/hour)
          </p>
        </>
      )}
    </>
  )
}

export default TimetableAnswer
