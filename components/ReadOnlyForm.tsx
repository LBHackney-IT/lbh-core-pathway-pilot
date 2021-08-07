import { Formik } from "formik"
import FlexibleField from "./FlexibleForms/FlexibleFields"
import { Resident, Field } from "../types"
import { InitialValues } from "../lib/utils"

interface Props {
  fields: Field[]
  person?: Resident
  values?: InitialValues
}

const ReadOnlyForm = ({ values, fields }: Props): React.ReactElement => (
  <Formik initialValues={values} onSubmit={null}>
    <>
      {fields.map(field => (
        <FlexibleField
          key={field.id}
          field={field}
          touched={null}
          errors={null}
          values={values}
          disabled={true}
        />
      ))}
    </>
  </Formik>
)

export default ReadOnlyForm
