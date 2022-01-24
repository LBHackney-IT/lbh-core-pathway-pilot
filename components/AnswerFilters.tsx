import answerFilters from "../config/answerFilters"

const Radio = ({ label, value, filter, setFilter }) => (
  <div className="govuk-radios__item">
    <input
      className="govuk-radios__input"
      id={`answer-filter-~-${value}`}
      type="radio"
      name="answer-filter"
      value={value}
      checked={filter === value}
      onChange={() => setFilter(value)}
    />
    <label
      className="govuk-label govuk-radios__label"
      htmlFor={`answer-filter-~-${value}`}
    >
      {label}
    </label>
  </div>
)

interface Props {
  filter: string
  setFilter: (val: string) => void
}

const AnswerFilters = ({ filter, setFilter }: Props): React.ReactElement => {
  // TODO: remove feature flag
  if (process.env.NEXT_PUBLIC_ENVIRONMENT === "prod") return null

  if (answerFilters)
    return (
      <fieldset className="govuk-form-group lbh-form-group govuk-fieldset">
        <legend className="lbh-body-s">Filter answers:</legend>

        <div className="govuk-radios lbh-radios govuk-radios--small govuk-radios--inline govuk-!-margin-top-2">
          <Radio label="All" filter={filter} setFilter={setFilter} value="" />

          {answerFilters.map(filterOption => (
            <Radio
              key={filterOption.id}
              label={filterOption.label}
              filter={filter}
              setFilter={setFilter}
              value={filterOption.id}
            />
          ))}
        </div>
      </fieldset>
    )

  return null
}

export default AnswerFilters
