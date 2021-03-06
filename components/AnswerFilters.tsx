import useAnswerFilters from "../hooks/useAnswerFilters"

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
  const { data: filters } = useAnswerFilters()
  return (
    <>
      {!!filters && (
        <fieldset className="govuk-form-group lbh-form-group govuk-fieldset">
          <legend className="lbh-body-s">Filter answers:</legend>

          <div className="govuk-radios lbh-radios govuk-radios--small govuk-radios--inline govuk-!-margin-top-2">
            <Radio label="All" filter={filter} setFilter={setFilter} value="" />

            {filters?.answerFilters?.map(filterOption => (
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
      )}
    </>
  )
}

export default AnswerFilters
