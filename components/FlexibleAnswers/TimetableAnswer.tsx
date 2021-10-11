import {
  TimetableAnswer as TimetableAnswerT,
  RepeaterGroupAnswer,
} from "../../types"
import { days, times } from "../../lib/forms"
import s from "./FlexibleAnswers.module.scss"

/** test if the answer group has any keys from the list of days. if so, it's probably timetable data */
export const isTimetableAnswer = (
  answerGroup: RepeaterGroupAnswer[] | TimetableAnswerT
): boolean => {
  const isTimetable = answers =>
    Object.keys(days).every(day => Object.keys(answers).includes(day))

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
}): React.ReactElement => (
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
            <td key={time}>{answers?.[shortDay]?.[time]}</td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
)

export default TimetableAnswer
