import {
  TimetableAnswer as TimetableAnswerT,
  RepeaterGroupAnswer,
} from "../../types"
import { days, times } from "../../lib/forms"
import s from "./FlexibleAnswers.module.scss"

/** test if the answer group has any keys from the list of days. if so, it's probably timetable data */
export const isTimetableAnswer = (
  answerGroup: RepeaterGroupAnswer[] | TimetableAnswerT
): boolean =>
  Object.keys(days).every(day => Object.keys(answerGroup).includes(day))

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
