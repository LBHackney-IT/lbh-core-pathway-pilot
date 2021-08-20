import { Formik } from "formik"
import FlexibleField from "./FlexibleForms/FlexibleFields"
import { Resident, Field } from "../types"
import { InitialValues } from "../lib/forms"
import s from "./ReadOnlyForm.module.scss"
import { useMemo } from "react"

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

const ReadOnlyForm = ({ values, fields }: Props): React.ReactElement => {
  const prefixedValues = useMemo(() => prefixNames(values), [values])

  return (
    <Formik initialValues={prefixedValues} onSubmit={null} className={s.form}>
      <div className={s.form}>
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
  )
}

export default ReadOnlyForm
