import { Formik } from "formik"
import FlexibleField from "./FlexibleForms/FlexibleFields"
import { Resident, Field } from "../types"
import { InitialValues } from "../lib/utils"
import s from "./ReadOnlyForm.module.scss"

interface Props {
  fields: Field[]
  person?: Resident
  values?: InitialValues
}

const ReadOnlyForm = ({ values, fields }: Props): React.ReactElement => (
  <Formik initialValues={values} onSubmit={null} className={s.form}>
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
          values={values}
          disabled={true}
        />
      ))}
    </div>
  </Formik>
)

export default ReadOnlyForm
