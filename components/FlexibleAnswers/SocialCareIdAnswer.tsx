import { RepeaterGroupAnswer } from "../../types"
import useResident from "../../hooks/useResident"
import { prettyDate, prettyResidentName } from "../../lib/formatters"
import s from "./SocialCareIdAnswer.module.scss"

const SocialCareIdAnswer = ({
  answer,
}: {
  answer: RepeaterGroupAnswer
}): React.ReactElement => {
  const { data: resident } = useResident(answer["Social care ID"] as string)

  if (resident) {
    const dateOfBirth = prettyDate(resident?.dateOfBirth ?? "")
    const displayAddress = resident?.addressList?.[0]

    return (
      <ul className={`govuk-list lbh-list ${s.socialCareIdAnswer}`}>
        <li>
          <strong>Name:</strong>{" "}
          <a
            href={`${process.env.NEXT_PUBLIC_SOCIAL_CARE_APP_URL}/people/${answer["Social care ID"]}`}
          >
            {prettyResidentName(resident)}
          </a>{" "}
        </li>
        <li>
          <strong>Social care ID:</strong> {resident.mosaicId}
        </li>
        <li>
          <strong>Date of birth:</strong> {dateOfBirth}
        </li>
        <li>
          <strong>Address:</strong> {displayAddress.addressLine1}
        </li>
        <li>
          <strong>Postcode:</strong> {displayAddress.postCode}
        </li>
        <li>
          <strong>Phone numbers:</strong>{" "}
          {resident.phoneNumber?.length > 0 ? (
            resident.phoneNumber
              .map(
                ({ phoneType, phoneNumber }) => `${phoneNumber} (${phoneType})`
              )
              .join(", ")
          ) : (
            <>Not known</>
          )}
        </li>
      </ul>
    )
  }

  return null
}

export const SocialCareIdRepeaterAnswer = ({
  answer,
}: {
  answer: RepeaterGroupAnswer
}): React.ReactElement => {
  const { data: resident } = useResident(answer["Social care ID"] as string)

  if (resident) {
    const dateOfBirth = prettyDate(resident?.dateOfBirth ?? "")
    const displayAddress = resident?.addressList?.[0]

    return (
      <>
        <li>
          <strong>Name:</strong>{" "}
          <a
            href={`${process.env.NEXT_PUBLIC_SOCIAL_CARE_APP_URL}/people/${answer["Social care ID"]}`}
          >
            {prettyResidentName(resident)}
          </a>{" "}
        </li>
        <li>
          <strong>Social care ID:</strong> {resident.mosaicId}
        </li>
        <li>
          <strong>Date of birth:</strong> {dateOfBirth}
        </li>
        <li>
          <strong>Address:</strong> {displayAddress.addressLine1}
        </li>
        <li>
          <strong>Postcode:</strong> {displayAddress.postCode}
        </li>
        <li>
          <strong>Phone numbers:</strong>{" "}
          {resident.phoneNumber?.length > 0 ? (
            resident.phoneNumber
              .map(
                ({ phoneType, phoneNumber }) => `${phoneNumber} (${phoneType})`
              )
              .join(", ")
          ) : (
            <>Not known</>
          )}
        </li>
      </>
    )
  }

  return null
}

export const isSocialCareIdAnswer = (answer: RepeaterGroupAnswer): boolean =>
  typeof answer === "object" &&
  !Array.isArray(answer) &&
  !!(
    "Name" in answer &&
    "Social care ID" in answer &&
    "Date of birth" in answer
  )

export const providedSocialCareIdAnswer = (
  answer: RepeaterGroupAnswer
): boolean => answer["Social care ID"] && answer["Social care ID"].length > 0

export default SocialCareIdAnswer
