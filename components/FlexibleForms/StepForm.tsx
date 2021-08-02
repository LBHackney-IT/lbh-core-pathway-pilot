import { useState } from "react"
import {
  Formik,
  Form,
  FormikValues,
  FormikHelpers,
  FormikTouched,
  FormikErrors,
} from "formik"
import { generateFlexibleSchema } from "../../lib/validators"
import FlexibleField from "./FlexibleFields"
import { Resident, Field } from "../../types"
import Banner from "./Banner"
import { generateInitialValues, InitialValues } from "../../lib/utils"
import { useAutosave, AutosaveTrigger } from "../../contexts/autosaveContext"
import { useRouter } from "next/router"

interface Props {
  fields: Field[]
  person?: Resident
  initialValues?: InitialValues
  onSubmit: (
    values: FormikValues,
    { setStatus }: FormikHelpers<FormikValues>
  ) => void
}

const StepForm = ({
  initialValues,
  fields,
  person,
  onSubmit,
}: Props): React.ReactElement => (
  <Formik
    initialValues={initialValues || generateInitialValues(fields, person)}
    validationSchema={generateFlexibleSchema(fields)}
    onSubmit={onSubmit}
    validateOnMount={true}
  >
    {formikProps => <StepFormInner {...formikProps} fields={fields} />}
  </Formik>
)

interface InnerProps {
  fields: Field[]
  touched: FormikTouched<FormikValues>
  errors: FormikErrors<FormikValues>
  values: FormikValues
  isValid: boolean
  isSubmitting: boolean
  submitForm: () => Promise<void>
  status?: string
}

const StepFormInner = ({
  fields,
  touched,
  errors,
  values,
  isValid,
  isSubmitting,
  submitForm,
  status,
}: InnerProps): React.ReactElement => {
  const [goBackToTaskList, setGoBackToTaskList] = useState<boolean>(false)
  const { saved, setSaved } = useAutosave()
  const router = useRouter()

  if (goBackToTaskList && saved && isValid) {
    router.push(`/submissions/${router.query.id}`)
  } else if (goBackToTaskList) {
    setGoBackToTaskList(false)
  }

  return (
    <Form>
      {status && (
        <Banner
          title="There was a problem saving your answers"
          className="lbh-page-announcement--warning"
        >
          <p>Please refresh the page or try again later.</p>
          <p className="lbh-body-xs">{status}</p>
        </Banner>
      )}

      {fields.map(field => (
        <FlexibleField
          key={field.id}
          field={field}
          touched={touched}
          errors={errors}
          values={values}
        />
      ))}

      <AutosaveTrigger delay={2000} />

      <button
        type="submit"
        className="govuk-button lbh-button"
        disabled={isSubmitting}
        onClick={async () => {
          await submitForm()
          if (isValid) {
            setSaved(true)
            setGoBackToTaskList(true)
          }
        }}
      >
        Save and continue
      </button>
    </Form>
  )
}

export default StepForm
