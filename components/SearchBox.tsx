interface Props {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  label?: string;
  placeholder?: string;
}

const SearchBox = ({
  searchQuery,
  setSearchQuery,
  placeholder = 'Search...',
  label = 'Search by name or ID',
}: Props): React.ReactElement => (
  <div className="govuk-form-group lbh-form-group govuk-!-margin-top-3 lbh-search-box">
    <label className="govuk-visually-hidden" htmlFor="search">
      {label}
    </label>

    <input
      className="govuk-input lbh-input govuk-input--width-10"
      id="search"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      type="search"
      placeholder={placeholder}
    />

    {searchQuery.length > 0 && (
      <button
        className="lbh-search-box__action"
        onClick={() => setSearchQuery('')}
      >
        <span className="govuk-visually-hidden">Clear search</span>
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <path
            d="M-0.0501709 1.36379L1.36404 -0.050415L12.6778 11.2633L11.2635 12.6775L-0.0501709 1.36379Z"
            fill="#0B0C0C"
          />
          <path
            d="M11.2635 -0.050293L12.6778 1.36392L1.36404 12.6776L-0.0501709 11.2634L11.2635 -0.050293Z"
            fill="#0B0C0C"
          />
        </svg>
      </button>
    )}
  </div>
);

export default SearchBox;
