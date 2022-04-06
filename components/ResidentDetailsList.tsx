import React from "react"
import useSuperResident from "../hooks/useSuperResident"
import { prettyDate } from "../lib/formatters"
import { Resident } from "../types"
import s from "./ResidentDetailsList.module.scss"
import { SuperResident } from "./ResidentDetailsList.types"

interface BasicRowProps {
  label: string
  value?: string
}

const Unknown = () => <span className={s.missing}>Not known</span>

const BasicRow = ({ label, value }: BasicRowProps) => (
  <div className="govuk-summary-list__row">
    <dt className="govuk-summary-list__key">{label}</dt>
    <dd className="govuk-summary-list__value">{value || <Unknown />}</dd>
  </div>
)

interface Props {
  socialCareId: string
}

const ResidentDetailsList = ({ socialCareId }: Props): React.ReactElement => {
  const { data: resident } = useSuperResident(socialCareId)
  
  // const {
  //   // mosaicId,
  //   firstName,
  //   lastName,
  //   dateOfBirth,
  //   ageContext,
  //   gender,
  //   // phoneNumber,
  //   // addressList,
  //   nhsNumber,
  //   otherNames,
  //   firstLanguage,
  //   emailAddress,
  //   preferredMethodOfContact,
  //   allocatedTeam,
  //   fluentInEnglish,
  // } = data

  if (resident) {return (
    <dl className="govuk-summary-list lbh-summary-list govuk-!-margin-top-6  govuk-!-margin-bottom-8">
      <BasicRow label="Name" value={`${resident.firstName} ${resident.lastName}`} />
      <BasicRow label="Name" value={`${resident.allocatedTeam} ${resident.lastName}`} />

      {/* <div className="govuk-summary-list__row">
        <dt className="govuk-summary-list__key">Other names</dt>
        <dd className="govuk-summary-list__value">
          {otherNames?.length > 0 ? (
            <ul className="lbh-list">
              {otherNames.map(({ firstName, lastName }) => (
                <li key={`${firstName} ${lastName}`}>
                  {firstName} {lastName}
                </li>
              ))}
            </ul>
          ) : (
            <Unknown />
          )}
        </dd>
      </div>

      <BasicRow label="Team" value={allocatedTeam} />
      <BasicRow
        label="Fluent in English"
        value={fluentInEnglish ? "Yes" : "No"}
      />
      <BasicRow label="Social care ID" value={mosaicId} />
      <BasicRow label="Gender" value={gender} />
      <BasicRow label="Date of birth" value={prettyDate(dateOfBirth)} />
      <BasicRow label="First language" value={firstLanguage} />

      <div className="govuk-summary-list__row">
        <dt className="govuk-summary-list__key">Addresses</dt>
        <dd className="govuk-summary-list__value">
          {addressList?.length > 0 ? (
            <ul className="lbh-list">
              {addressList
                .filter(address => !address.endDate)
                .map(({ addressLine1, postCode }) => (
                  <li key={addressLine1}>
                    {addressLine1}, {postCode}
                  </li>
                ))}
            </ul>
          ) : (
            <Unknown />
          )}
        </dd>
      </div>

      <div className="govuk-summary-list__row">
        <dt className="govuk-summary-list__key">Phone numbers</dt>
        <dd className="govuk-summary-list__value">
          {phoneNumber?.length > 0 ? (
            <ul className="lbh-list">
              {phoneNumber.map(({ phoneType, phoneNumber }) => (
                <li key={phoneNumber}>
                  <strong>{phoneType}</strong>, {phoneNumber}
                </li>
              ))}
            </ul>
          ) : (
            <Unknown />
          )}
        </dd>
      </div>

      <BasicRow label="Email address" value={emailAddress} />
      <BasicRow
        label="Preferred method of contact"
        value={preferredMethodOfContact}
      />
      <BasicRow
        label="Service area"
        value={ageContext === "C" ? "Children" : "Adults"}
      />
      <BasicRow label="NHS number" value={nhsNumber} /> */}


    </dl>
  )} 
  return null
}

export default ResidentDetailsList
