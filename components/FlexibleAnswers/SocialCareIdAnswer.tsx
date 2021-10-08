import { RepeaterGroupAnswer } from "../../types"

const SocialCareIdAnswer = ({
  answer,
}: {
  answer: RepeaterGroupAnswer
}): React.ReactElement => (
  <ul className="govuk-list lbh-list">
    <li>
      <strong>Name:</strong> <a href={`${process.env.NEXT_PUBLIC_SOCIAL_CARE_APP_URL}/people/${answer["Social care ID"]}`}>{answer["Name"]}</a>
    </li>
    <li>
      <strong>Social care ID:</strong> #{answer["Social care ID"]}
    </li>
    <li>
      <strong>Date of birth:</strong> {answer["Date of birth"]}
    </li>
  </ul>
)

export const isSocialCareIdAnswer = (answer: RepeaterGroupAnswer): boolean =>
  typeof answer === 'object' &&
  !Array.isArray(answer) &&
  !!("Name" in answer && "Social care ID" in answer && "Date of birth" in answer)

export const providedSocialCareIdAnswer = (answer: RepeaterGroupAnswer): boolean =>
  answer["Social care ID"] && answer["Social care ID"].length > 0;

export default SocialCareIdAnswer
