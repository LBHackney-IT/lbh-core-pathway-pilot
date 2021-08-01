import s from "./FullPageSpinner.module.scss"

const FullPageSpinner = (): React.ReactElement => (
  <div className={s.outer}>
    <img alt="Loading..." src="/spinner.svg" className={s.spinner} />
  </div>
)

export default FullPageSpinner
