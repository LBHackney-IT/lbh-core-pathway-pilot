import React from "react"
import s from "./UnlinkedReassessmentPanel.module.scss"
import Link from "next/link"

interface Props {
  socialCareId: string
}

const UnlinkedReassessmentPanel = ({
  socialCareId,
}: Props): React.ReactElement => (
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
          imported, you can still{" "}
          <Link
            href={`/workflows/new?social_care_id=${socialCareId}`}
          >
            start an unlinked reassessment
          </Link>
          .
        </p>
        <p>
          You will not be able to see answers from the previous workflow
          side-by-side.
        </p>
      </strong>
    </div>
  </section>
)

export default UnlinkedReassessmentPanel
