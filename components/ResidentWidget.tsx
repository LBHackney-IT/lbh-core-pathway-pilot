import React from "react"
import useResident from "../hooks/useResident"
import { prettyDate } from "../lib/formatters"
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
        <p>This is for:</p>
        <aside className={s.aside}>
          <h2 className={`lbh-heading-h3 ${s.title}`}>
            {resident.firstName} {resident.lastName}
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
