import s from "./PrintableWorkflow.module.scss"
import { Form } from "../types"

interface Props {
  form: Form
}

const PrintableWorkflow = ({ form }: Props): React.ReactElement => (
  <div className={s.form}>
    <h1>{form.name}</h1>
    <p>* indicates a required question</p>
    {form.steps.map((step, i) => (
      <div className={s.step} key={`step-${step.id}`}>
        <h2>
          {i + 1}. {step.name}
        </h2>
        <p>{step.intro}</p>
        {step.fields.map(field => (
          <div key={`step-${step.id}-field-${field.id}`}>
            <h3>
              {field.question}
              {field.required && "*"}
            </h3>
            <p>{field.hint}</p>

            {["text", "date"].includes(field.type) && (
              <div className={s.text} />
            )}
            {["textarea", "repeater", "timetable", "repeaterGroup"].includes(
              field.type
            ) && <div className={s.textarea} />}
            {["radios", "select", "combobox"].includes(field.type) && (
              <>
                <p>Choose one</p>
                {field?.choices?.map(choice => (
                  <div key={choice.label} className={s.round}>
                    {choice.label}
                  </div>
                ))}
              </>
            )}
            {["checkboxes", "tags"].includes(field.type) && (
              <>
                <p>Choose all that apply</p>
                {field?.choices?.map(choice => (
                  <div key={choice.label} className={s.square}>
                    {choice.label}
                  </div>
                ))}
              </>
            )}
          </div>
        ))}
      </div>
    ))}
  </div>
)

export default PrintableWorkflow
