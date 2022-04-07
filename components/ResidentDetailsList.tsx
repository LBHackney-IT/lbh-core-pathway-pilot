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

  if (resident) {
    return (
      <dl className="govuk-summary-list lbh-summary-list govuk-!-margin-top-6  govuk-!-margin-bottom-8">
        <BasicRow label="Social care ID" value={String(resident.id)} />
        <BasicRow
          label="Service area"
          value={resident.ageContext === "C" ? "Children" : "Adults"}
        />
        <BasicRow label="Allocated team" value={resident.allocatedTeam} />
        <BasicRow label="Title" value={resident.title} />
        <BasicRow label="First name" value={resident.firstName} />
        <BasicRow label="Last name" value={resident.lastName} />
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">Other names</dt>
          <dd className="govuk-summary-list__value">
            {resident.otherNames?.length > 0 ? (
              <ul className="lbh-list">
                {resident.otherNames.map(({ firstName, lastName }) => (
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
        <BasicRow
          label="Date of birth"
          value={prettyDate(resident.dateOfBirth)}
        />
        <BasicRow label="Died" value={prettyDate(resident.dateOfDeath)} />
        <BasicRow label="Gender" value={resident.gender} /> {/* //convert? */}
        <BasicRow
          label="Same gender as assigned at birth?"
          value={resident.genderAssignedAtBirth ? "Yes" : "No"}
        />
        <BasicRow label="Pronoun" value={resident.pronoun} />
        <BasicRow
          label="Sexual orientation"
          value={resident.sexualOrientation}
        />
        <BasicRow label="Ethnicity" value={resident.ethnicity} />{" "}
        {/* //convert? */}
        <BasicRow label="Email address" value={resident.emailAddress} />
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">Phone numbers</dt>
          <dd className="govuk-summary-list__value">
            {resident.phoneNumbers?.length > 0 ? (
              <ul className="lbh-list">
                {resident.phoneNumbers.map(({ type, number }) => (
                  <li key={number}>
                    <strong>{type}</strong>, {number}
                  </li>
                ))}
              </ul>
            ) : (
              <Unknown />
            )}
          </dd>
        </div>
        <BasicRow
          label="Restricted?"
          value={resident.restricted === "Y" ? "Yes" : "No"}
        />
        <BasicRow label="Religion" value={resident.religion} />
        <BasicRow label="Employment" value={resident.employment} />
        <BasicRow label="Marital status" value={resident.maritalStatus} />
        <BasicRow
          label="Immigration status"
          value={resident.immigrationStatus}
        />
        <BasicRow label="Care provider" value={resident.careProvider} />
        <BasicRow
          label="Primary support reason"
          value={resident.primarySupportReason}
        />
        {/*  Health and disability*/}
        <BasicRow
          label="NHS number"
          value={resident.nhsNumber ? String(resident.nhsNumber) : ""}
        />
        <div>
          <ul className="lbh-list lbh-body-s ">
            <li className="govuk-!-margin-top-0">
              <strong>{resident.gpDetails?.name}</strong>
            </li>
            <li className="govuk-!-margin-top-0">
              {resident.gpDetails?.address}
            </li>
            <li className="govuk-!-margin-top-0">
              {resident.gpDetails?.postcode}
            </li>
            <li className="govuk-!-margin-top-0">
              <a href={`mailto:${resident.gpDetails?.email}`}>
                {resident.gpDetails?.email}
              </a>
            </li>
            <li className="govuk-!-margin-top-0">
              {resident.gpDetails?.phoneNumber}
            </li>
          </ul>
        </div>
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">GP</dt>
          <dd className="govuk-summary-list__value">
            {resident.gpDetails ? (
              <ul className="lbh-list lbh-body-s ">
                <li className="govuk-!-margin-top-0">
                  <strong>{resident.gpDetails?.name}</strong>
                </li>
                <li className="govuk-!-margin-top-0">
                  {resident.gpDetails?.address}
                </li>
                <li className="govuk-!-margin-top-0">
                  {resident.gpDetails?.postcode}
                </li>
                <li className="govuk-!-margin-top-0">
                  <a href={`mailto:${resident.gpDetails?.email}`}>
                    {resident.gpDetails?.email}
                  </a>
                </li>
                <li className="govuk-!-margin-top-0">
                  {resident.gpDetails?.phoneNumber}
                </li>
              </ul>
            ) : (
              <Unknown />
            )}
          </dd>
        </div>
        {/* <BasicRow label="GP" value={resident.gpDetails} />

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
    )
  }
  return null
}

export default ResidentDetailsList
