import { useEffect, useState } from "react"
import useResident from "../../hooks/useResident"
import s from "./Filters.module.scss"

interface Props {
  value: string
  onChange: (string) => void
}

/** WIP: not yet ready for use */
const SocialCareIdOrNameField = ({
  value,
  onChange,
}: Props): React.ReactElement => {
  const [q, setQ] = useState<string>("")

  //   TODO: build a hook that will support finding a resident by name
  const { data: resident, error } = useResident(q)

  useEffect(() => {
    if (!parseInt(q)) onChange(resident.mosaicId)
  }, [resident, q, onChange])

  return (
    <div className="govuk-form-group lbh-form-group">
      <label className={s.legendLabel} htmlFor="social-care-id">
        Social care ID or name
      </label>

      {!error && !resident && <p>Loading...</p>}

      <input
        className="govuk-input lbh-input"
        id="social-care-id"
        value={value}
        placeholder="eg. 12345"
        onChange={e => {
          setQ(e.target.value)
          onChange(e.target.value)
        }}
      />
    </div>
  )
}

export default SocialCareIdOrNameField
