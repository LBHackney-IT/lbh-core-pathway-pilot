import React from "react"
import s from "./WarningPanel.module.scss"

interface Props {
  children: React.ReactNode
}

const WarningPanel = ({ children }: Props): React.ReactElement => {
  return (
    <div className={s.mutedPanel}>
      <div className={`govuk-warning-text lbh-warning-text ${s.warningText}`}>
        <span
          className={`govuk-warning-text__icon ${s.icon}`}
          aria-hidden="true"
        >
          !
        </span>
        <div className={`govuk-warning-text__text ${s.text}`}>{children}</div>
      </div>
    </div>
  )
}

export default WarningPanel
