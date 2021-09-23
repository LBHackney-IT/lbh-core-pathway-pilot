import { getIn } from "formik"
import { FlexibleAnswers } from "../../types"
import s from "./EchoField.module.scss"

interface FieldProps {
  answers?: FlexibleAnswers
  path: string
}

const EchoField = ({
  answers,
  path,
}: FieldProps): React.ReactElement | null => {
  const answer = getIn(answers, path)

  if (answer && typeof answer === "string")
    return (
      <blockquote
        data-testid="echo"
        className="govuk-form-group lbh-form-group govuk-inset-text lbh-inset-text"
      >
        <q>{answer}</q>
        <cite className={`lbh-body-s govuk-!-margin-top-2 ${s.cite}`}>
          From your earlier answers
        </cite>
      </blockquote>
    )

  return null
}

export default EchoField
