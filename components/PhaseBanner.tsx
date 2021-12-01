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
        Beta
      </strong>
      <span className="govuk-phase-banner__text">
        This is a brand new service —&nbsp;
        <a
          href="https://forms.gle/pVuBfxcm2kqxT8D68"
          className="lbh-link lbh-link--no-visited-state"
          target="_blank"
          rel="noreferrer noopener"
        >
          give feedback
        </a>{" "}
        or{" "}
        <a
          href="https://sites.google.com/hackney.gov.uk/moderntoolsforsocialcare/core-pathway-pilot"
          className="lbh-link lbh-link--no-visited-state"
          target="_blank"
          rel="noreferrer noopener"
        >
          read about this work
        </a>
        .
      </span>
    </p>
  </div>
)

export default PhaseBanner
