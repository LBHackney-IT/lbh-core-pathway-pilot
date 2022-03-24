import React from "react"
import useResident from "../hooks/useResident"
import { prettyDate, prettyResidentName } from "../lib/formatters"
import s from "./ResidentWidget.module.scss"

interface Props {
  socialCareId: string
}

const ResidentWidget = ({ socialCareId }: Props): React.ReactElement => {
  const { data: resident } = useResident(socialCareId)

  if (resident) {
    const dateOfBirth = prettyDate(resident?.dateOfBirth ?? "")
    const displayAddress = resident?.addressList?.[0]

    return (
      <>
        <p className="lbh-body-s">This assessment is for:</p>
        <aside className={s.aside}>
          <h2 className={`lbh-heading-h3 ${s.title}`}>
            <a
              className="lbh-link lbh-link--no-visited-state"
              href={`${process.env.NEXT_PUBLIC_SOCIAL_CARE_APP_URL}/residents/${resident.mosaicId}`}
            >
              {prettyResidentName(resident)}
            </a>
          </h2>

          <p className={`lbh-body-s ${s.paragraph}`}>#{socialCareId}</p>

          {dateOfBirth && (
            <p className={`lbh-body-s ${s.paragraph}`}>Born {dateOfBirth}</p>
          )}
          {displayAddress && (
            <p className={`lbh-body-s ${s.paragraph}`}>
              {displayAddress?.addressLine1}
              <br />
              {displayAddress?.postCode}
            </p>
          )}
        </aside>
      </>
    )
  }

  return null
}

export default ResidentWidget
