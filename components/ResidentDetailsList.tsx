import React from "react"
import { prettyDate } from "../lib/formatters"
import { Resident } from "../types"
import s from "./ResidentDetailsList.module.scss"

interface BasicRowProps {
  label: string
  value?: string
}

const BasicRow = ({ label, value }: BasicRowProps) => {
  // if (value)
  return (
    <div className="govuk-summary-list__row">
      <dt className="govuk-summary-list__key">{label}</dt>
      <dd className="govuk-summary-list__value">
        {value || <span className={s.missing}>Not known</span>}
      </dd>
    </div>
  )
}

interface Props {
  resident: Resident
}

const ResidentDetailsList = ({ resident }: Props): React.ReactElement => {
  const {
    mosaicId,
    firstName,
    lastName,
    dateOfBirth,
    ageContext,
    gender,
    nationality,
    phoneNumber,
    addressList,
    nhsNumber,
  } = resident

  return (
    <dl className="govuk-summary-list lbh-summary-list govuk-!-margin-top-6  govuk-!-margin-bottom-8">
      <BasicRow label="Name" value={`${firstName} ${lastName}`} />
      <BasicRow label="Social care ID" value={mosaicId} />
      <BasicRow label="Gender" value={gender} />
      <BasicRow label="Date of birth" value={prettyDate(dateOfBirth)} />
      <BasicRow label="Nationality" value={nationality} />

      {phoneNumber?.length > 0 && (
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">Phone numbers</dt>
          <dd className="govuk-summary-list__value">
            <ul className="lbh-list">
              {phoneNumber.map(({ phoneType, phoneNumber }) => (
                <li key={phoneNumber}>
                  <strong>{phoneType}</strong>, {phoneNumber}
                </li>
              ))}
            </ul>
          </dd>
        </div>
      )}

      {addressList?.length > 0 && (
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">Addresses</dt>
          <dd className="govuk-summary-list__value">
            <ul className="lbh-list">
              {addressList.map(({ addressLine1, postCode }) => (
                <li key={addressLine1}>
                  {addressLine1}, {postCode}
                </li>
              ))}
            </ul>
          </dd>
        </div>
      )}

      <BasicRow
        label="Service area"
        value={ageContext === "C" ? "Children" : "Adults"}
      />
      <BasicRow label="NHS number" value={nhsNumber} />
    </dl>
  )
}

export default ResidentDetailsList
