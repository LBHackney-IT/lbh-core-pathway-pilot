import React from "react"
import { QueryParams } from "../hooks/useQueryParams"
import { Status } from "../types"
import s from "./UnlinkedReassessmentPanel.module.scss"

interface Props {
  queryParams: QueryParams
}

const UnlinkedReassessmentPanel = ({
  queryParams,
}: Props): React.ReactElement => {
  if (
    [Status.ReviewSoon, Status.NoAction].includes(
      queryParams["status"] as Status
    )
  )
    return (
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
              <a href="#">start an unlinked reassessment</a>.
            </p>
            <p>
              You will not be able to see answers from the previous workflow
              side-by-side.
            </p>
          </strong>
        </div>
      </section>
    )

  return null
}

export default UnlinkedReassessmentPanel
