import React from "react"
import useFullResident from "../hooks/useFullResident"
import { displayEthnicity, prettyDate, prettyTime } from "../lib/formatters"
import s from "./ResidentDetailsList.module.scss"

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

const dateDisplay = (workflowSubmittedAt?: string) => (
  <div className="govuk-hint lbh-hint">
    The resident data shown below was last updated on{" "}
    {prettyDate(workflowSubmittedAt)} at {prettyTime(workflowSubmittedAt)}.
    Contact the support email if you need to know what the data was on an
    earlier date.
  </div>
)

interface Props {
  socialCareId: string
  workflowId?: string
}

const ResidentDetailsList = ({
  socialCareId,
  workflowId,
}: Props): React.ReactElement => {
  const { data: resident } = useFullResident(socialCareId, workflowId)

  if (resident) {
    if (resident.workflowSubmittedAt && !resident.fromSnapshot) {
      return (
        <div>
          {resident && dateDisplay(new Date().toISOString())}
          <dl className="govuk-summary-list lbh-summary-list govuk-!-margin-top-6  govuk-!-margin-bottom-8">
            <BasicRow
              label="Name"
              value={`${resident.firstName} ${resident.lastName}`}
            />

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
              label="Social care ID"
              value={numberHandler(resident.id)}
            />
            <BasicRow label="Gender" value={resident.gender} />
            <BasicRow
              label="Date of birth"
              value={prettyDate(resident.dateOfBirth)}
            />
            <BasicRow label="First language" value={resident.firstLanguage} />

            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Addresses</dt>
              <dd className="govuk-summary-list__value">
                {resident.address ? (
                  <ul className="lbh-list">
                    {
                      <li key={resident.address.address}>
                        {resident.address.address}, {resident.address.postcode}
                      </li>
                    }
                  </ul>
                ) : (
                  <Unknown />
                )}
              </dd>
            </div>
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
            <BasicRow label="Email address" value={resident.emailAddress} />
            <BasicRow
              label="Preferred method of contact"
              value={resident.preferredMethodOfContact}
            />
            <BasicRow
              label="Service area"
              value={resident.ageContext === "C" ? "Children" : "Adults"}
            />
            <BasicRow
              label="NHS number"
              value={numberHandler(resident.nhsNumber)}
            />
          </dl>
        </div>
      )
    } else {
      return (
        <div>
          {resident.workflowSubmittedAt &&
            resident.fromSnapshot &&
            dateDisplay(new Date(resident.workflowSubmittedAt).toISOString())}
          {!resident.fromSnapshot &&
            workflowId &&
            dateDisplay(new Date().toISOString())}
          <section className={s.outer}>
            <header className={`lbh-heading-h4 ${s.header}`}>
              Personal details
            </header>
            <dl className="govuk-summary-list lbh-summary-list govuk-!-margin-top-1  govuk-!-margin-bottom-6">
              <BasicRow
                label="Social care ID"
                value={numberHandler(resident.id)}
              />
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
              <BasicRow label="Pronoun" value={resident.pronoun} />
              <BasicRow
                label="Ethnicity"
                value={displayEthnicity(resident.ethnicity)}
              />
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
              <BasicRow label="Religion" value={resident.religion} />
              <BasicRow label="Employment" value={resident.employment} />
              <BasicRow label="Marital status" value={resident.maritalStatus} />
              <BasicRow
                label="Immigration status"
                value={resident.immigrationStatus}
              />
              <BasicRow
                label="Primary support reason"
                value={resident.primarySupportReason}
              />
            </dl>
          </section>
          <section className={s.outer}>
            <header className={`lbh-heading-h4 ${s.header}`}>
              Health and disability
            </header>
            <dl className="govuk-summary-list lbh-summary-list govuk-!-margin-top-1  govuk-!-margin-bottom-6">
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
            </dl>
          </section>
          <section className={s.outer}>
            <header className={`lbh-heading-h4 ${s.header}`}>Housing</header>
            <dl className="govuk-summary-list lbh-summary-list govuk-!-margin-top-1  govuk-!-margin-bottom-6">
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
              <BasicRow
                label="Living situation"
                value={resident.livingSituation}
              />
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
            </dl>
          </section>
          <section className={s.outer}>
            <header className={`lbh-heading-h4 ${s.header}`}>
              Communication needs and preferences
            </header>

            <dl className="govuk-summary-list lbh-summary-list govuk-!-margin-top-1  govuk-!-margin-bottom-6">
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
            </dl>
          </section>
        </div>
      )
    }
  }
  return null
}

export default ResidentDetailsList
