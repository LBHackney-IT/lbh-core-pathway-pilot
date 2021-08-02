import React from "react"
import { prettyDate } from "../lib/formatters"
import { Resident } from "../types"
import s from "./residentWidget.module.scss"

interface Props {
  resident: Resident
}

const ResidentWidget = ({ resident }: Props): React.ReactElement => {
  const dateOfBirth = prettyDate(resident?.dateOfBirth ?? "")
  const displayAddress = resident?.addressList[0]

  return (
    <aside className={s.aside}>
      <h2 className={`lbh-heading-h3 ${s.title}`}>
        {resident.firstName} {resident.lastName}
      </h2>

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
  )
}

export default ResidentWidget
