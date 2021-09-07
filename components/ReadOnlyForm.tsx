import { Formik } from "formik"
import FlexibleField from "./FlexibleForms/FlexibleFields"
import { Resident, Field } from "../types"
import { InitialValues } from "../lib/forms"
import s from "./ReadOnlyForm.module.scss"
import { useMemo, useState } from "react"
import cx from "classnames"

interface Props {
  fields: Field[]
  person?: Resident
  values?: InitialValues
}

const prefixNames = (oldValues: InitialValues): InitialValues => {
  const newValues = {}
  Object.entries(oldValues).map(([id, answer]) => {
    newValues[`ro-${id}`] = answer
  })
  return newValues
}

const ReadOnlyForm = ({ values = {}, fields }: Props): React.ReactElement => {
  const [open, setOpen] = useState<boolean>(false)

  const prefixedValues = useMemo(() => prefixNames(values), [values])

  return (
    <>
      <button
        className={s.button}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        {open ? "Collapse previous answers" : "Expand previous answers"}

        <svg
          className="down-arrow-icon"
          xmlns="http://www.w3.org/2000/svg"
          x="0px"
          y="0px"
          width="284.929px"
          height="284.929px"
          viewBox="0 0 284.929 284.929"
        >
          <g>
            <path
              fill="#0B0C0C"
              d="M282.082,76.511l-14.274-14.273c-1.902-1.906-4.093-2.856-6.57-2.856c-2.471,0-4.661,0.95-6.563,2.856L142.466,174.441
		L30.262,62.241c-1.903-1.906-4.093-2.856-6.567-2.856c-2.475,0-4.665,0.95-6.567,2.856L2.856,76.515C0.95,78.417,0,80.607,0,83.082
		c0,2.473,0.953,4.663,2.856,6.565l133.043,133.046c1.902,1.903,4.093,2.854,6.567,2.854s4.661-0.951,6.562-2.854L282.082,89.647
		c1.902-1.903,2.847-4.093,2.847-6.565C284.929,80.607,283.984,78.417,282.082,76.511z"
            />
          </g>
        </svg>
      </button>
      {open}
      <Formik initialValues={prefixedValues} onSubmit={null}>
        <div className={cx(s.form, { [s.closed]: open })}>
          {fields.map(field => (
            <FlexibleField
              key={field.id}
              field={{
                ...field,
                id: `ro-${field.id}`,
              }}
              touched={null}
              errors={null}
              values={prefixedValues}
              disabled={true}
            />
          ))}
        </div>
      </Formik>
    </>
  )
}

export default ReadOnlyForm
