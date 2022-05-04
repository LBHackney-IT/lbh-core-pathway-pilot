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
        Support
      </strong>
      <span className="govuk-phase-banner__text">
        Need help? Check out the{" "}
        <a
          href="https://docs.google.com/document/d/1eM2anY9Ddot79Gl1N386ANG6ahyn4gjZr6vsoQQGLZg/edit#"
          className="lbh-link lbh-link--no-visited-state"
          target="_blank"
          rel="noreferrer noopener"
        >
          FAQ
        </a>{" "}
        or the{" "}
        <a
          href="https://docs.google.com/presentation/d/1AiTljatPK58xBk2Y7R9h9mUwDpusekv2jkuCgwMWpGk/edit#slide=id.gebf6791975_1_135"
          className="lbh-link lbh-link--no-visited-state"
          target="_blank"
          rel="noreferrer noopener"
        >
          handbook
        </a>
        . If you don&apos;t find the answer, contact{" "}
        <a href="mailto:social-care.support@hackney.gov.uk">support</a>{" "}
      </span>
    </p>
  </div>
)

export default PhaseBanner
