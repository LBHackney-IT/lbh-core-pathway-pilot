interface Props {
  fullWidth?: boolean
}

const PhaseBanner = ({ fullWidth }: Props): React.ReactElement => (
  <div
    data-testid="full-width-container"
    className={`govuk-phase-banner lbh-phase-banner lbh-container ${
      fullWidth && "lmf-full-width"
    }`}
  >
    <p className="govuk-phase-banner__content">
      <strong className="govuk-tag govuk-phase-banner__content__tag lbh-tag">
        Prototype
      </strong>
      <span className="govuk-phase-banner__text">
        This is an experimental service. Some parts may not work.
      </span>
    </p>
  </div>
)

export default PhaseBanner
