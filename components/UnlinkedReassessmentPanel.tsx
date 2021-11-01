import React from "react"
import s from "./UnlinkedReassessmentPanel.module.scss"

const UnlinkedReassessmentPanel = (): React.ReactElement => (
  <section className={s.outer}>
    <div className={`govuk-warning-text lbh-warning-text ${s.inner}`}>
      <span
        className={`govuk-warning-text__icon  ${s.icon}`}
        aria-hidden="true"
      >
        !
      </span>
      <strong className={`govuk-warning-text__text ${s.text}`}>
        <h2>Trying to start a reassessment?</h2>
        <p>
          If the original workflow doesn&apos;t exist, or hasn&apos;t been
          imported, you can still <a href="#">start an unlinked reassessment</a>
          .
        </p>
        <p>
          You will not be able to see answers from the previous workflow
          side-by-side.
        </p>
        {/* <a
          href="#"
          className="govuk-button lbh-button govuk-button--secondary lbh-button--secondary"
        >
          Start unlinked reassessment
        </a> */}
      </strong>
    </div>
  </section>
)

export default UnlinkedReassessmentPanel
