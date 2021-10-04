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
        Pilot
      </strong>
      <span className="govuk-phase-banner__text">
        This is a preview of a brand new service—
        <a
          href="https://forms.gle/pVuBfxcm2kqxT8D68"
          className="lbh-link lbh-link--no-visited-state"
          target="_blank"
          rel="noreferrer"
        >
          your feedback
        </a>{" "}
        helps us improve it.
      </span>
    </p>
  </div>
)

export default PhaseBanner
