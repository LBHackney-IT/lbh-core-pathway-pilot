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

const booleanHandler = (inputValue: boolean): string =>
  inputValue === undefined || inputValue === null
    ? ""
    : inputValue
    ? "Yes"
    : "No"

const numberHandler = (inputValue: number): string =>
  inputValue ? String(inputValue) : ""

interface Props {
  socialCareId: string
}

const ResidentDetailsList = ({ socialCareId }: Props): React.ReactElement => {
  const { data: resident } = useSuperResident(socialCareId)

  if (resident) {
    return (
      <dl className="govuk-summary-list lbh-summary-list govuk-!-margin-top-6  govuk-!-margin-bottom-8">
        <div className="govuk-label govuk-label--m lbh-label">
          Personal details
        </div>
        <BasicRow label="Social care ID" value={numberHandler(resident.id)} />
        <BasicRow
          label="Service area"
          value={
            resident.contextFlag === "C"
              ? "Children's social care"
              : resident.contextFlag === "A"
              ? "Adult social care"
              : ""
          }
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
        <BasicRow
          label="Gender"
          value={
            resident.gender === "F"
              ? "Female"
              : resident.gender === "M"
              ? "Male"
              : resident.gender
          }
        />
        <BasicRow
          label="Same gender as assigned at birth?"
          value={booleanHandler(resident.genderAssignedAtBirth)}
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
                    <strong>{type}</strong>: {number}
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
        <div className="govuk-label govuk-label--m lbh-label">
          Health and disability
        </div>
        <BasicRow
          label="NHS number"
          value={numberHandler(resident.nhsNumber)}
        />
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
        <BasicRow
          label="Disabilities"
          value={(resident.disabilities as string[])?.join(", ")}
        />
        <BasicRow
          label="Mental health section status"
          value={resident.mentalHealthSectionStatus}
        />
        <BasicRow label="Hearing loss" value={resident.deafRegister} />
        <BasicRow label="Sight loss" value={resident.blindRegister} />
        <BasicRow
          label="Blue badge"
          value={booleanHandler(resident.blueBadge)}
        />
        {/* Housing */}
        <div className="govuk-label govuk-label--m lbh-label">Housing</div>
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">Address</dt>
          <dd className="govuk-summary-list__value">
            {resident.address &&
            (resident.address.address || resident.address.postcode) ? (
              <ul className="lbh-list">
                <li key={resident.address.address}>
                  {resident.address.address}
                  <br /> {resident.address.postcode}
                </li>
              </ul>
            ) : (
              <Unknown />
            )}
          </dd>
        </div>
        <BasicRow label="Living situation" value={resident.livingSituation} />
        <BasicRow
          label="Access to home (eg. keybox)"
          value={resident.accessToHome}
        />
        <BasicRow
          label="Accommodation type"
          value={resident.accomodationType}
        />
        <BasicRow
          label="Known to housing staff?"
          value={booleanHandler(resident.housingStaffInContact)}
        />
        <BasicRow
          label="Housing officer's name"
          value={resident.housingOfficer}
        />
        {/* Relationships and support network */}
        <div className="govuk-label govuk-label--m lbh-label">
          Relationships and support network
        </div>
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">Key contacts</dt>
          <dd className="govuk-summary-list__value">
            {resident.keyContacts?.length > 0 ? (
              <ul className="lbh-list">
                {resident.keyContacts.map((contact, i) => (
                  <li key={i} className="govuk-!-margin-top-0">
                    <strong>{contact.name}:</strong>{" "}
                    <a
                      className="lbh-link lbh-link--no-visited-state"
                      href={`mailto:${contact.email}`}
                    >
                      {contact.email}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <Unknown />
            )}
          </dd>
        </div>
        {/* Communication needs and preferences */}
        <div className="govuk-label govuk-label--m lbh-label">
          Communication needs and preferences
        </div>
        <BasicRow label="First language" value={resident.firstLanguage} />
        <BasicRow
          label="Preferred language"
          value={resident.preferredLanguage}
        />
        <BasicRow
          label="Fluent in English?"
          value={booleanHandler(resident.fluentInEnglish)}
        />
        <BasicRow
          label="Interpreter needed?"
          value={booleanHandler(resident.interpreterNeeded)}
        />
        <BasicRow
          label="Contact preference"
          value={resident.preferredMethodOfContact}
        />
        <BasicRow
          label="What technology do they use?"
          value={resident.techUse?.join(", ")}
        />
        <BasicRow
          label="Any difficulty making decisions?"
          value={booleanHandler(resident.difficultyMakingDecisions)}
        />
        <BasicRow
          label="Any difficulty communicating?"
          value={booleanHandler(resident.communicationDifficulties)}
        />
      </dl>
    )
  }
  return null
}

export default ResidentDetailsList
