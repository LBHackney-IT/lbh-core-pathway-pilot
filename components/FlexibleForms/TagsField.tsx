import { useState } from "react"
import {
  useFormikContext,
  getIn,
  ErrorMessage,
  FormikErrors,
  FormikTouched,
  FormikValues,
} from "formik"
import { useCombobox } from "downshift"
import s from "./ComboboxField.module.scss"
import cx from "classnames"
import { Choice } from "../../types"

interface FieldProps {
  touched: FormikTouched<FormikValues>
  errors: FormikErrors<FormikValues>
  name: string
  label: string
  type?: string
  hint?: string
  className?: string
  required?: boolean
  itemName?: string
  choices: Choice[]
}

const Field = ({
  touched,
  errors,
  name,
  label,
  hint,
  className,
  required,
  itemName,
  choices,
}: FieldProps): React.ReactElement => {
  const { values, setFieldValue } = useFormikContext<FormikValues>()
  const [inputValue, setInputValue] = useState<string>("")

  const tags: string[] = values[name]

  const items = choices
    .map(choice => choice.label)
    .filter(tag => !values[name].includes(tag))
    .filter(
      item =>
        tags.indexOf(item) < 0 &&
        item.toLowerCase().startsWith(inputValue.toLowerCase())
    )

  const {
    isOpen,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    getInputProps,
    getComboboxProps,
    getItemProps,
    toggleMenu,
  } = useCombobox({
    inputValue,
    defaultHighlightedIndex: 0, // after selection, highlight the first item.
    selectedItem: null,
    items: items.length > 0 ? items : [inputValue],
    onStateChange: ({ inputValue, type, selectedItem }) => {
      switch (type) {
        case useCombobox.stateChangeTypes.InputChange:
          setInputValue(inputValue as string)
          break
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.ItemClick:
        case useCombobox.stateChangeTypes.InputBlur:
          if (selectedItem) {
            setFieldValue(name, [...tags, selectedItem])
            setInputValue("")
          }
          break
        default:
          break
      }
    },
  })

  return (
    <div
      className={`govuk-form-group lbh-form-group ${
        getIn(touched, name) && getIn(errors, name) && "govuk-form-group--error"
      }`}
    >
      <label
        data-testid={name}
        className="govuk-label lbh-label"
        {...getLabelProps()}
      >
        {label}
        {required && (
          <span className="govuk-required">
            <span aria-hidden="true">*</span>
            <span className="govuk-visually-hidden">required</span>
          </span>
        )}
      </label>

      {hint && (
        <span id={`${name}-hint`} className="govuk-hint lbh-hint">
          {hint}
        </span>
      )}

      <ErrorMessage name={name}>
        {msg => (
          <p className="govuk-error-message lbh-error-message" role="alert">
            <span className="govuk-visually-hidden">Error:</span>
            {msg}
          </p>
        )}
      </ErrorMessage>

      <div
        className="govuk-!-margin-top-0 govuk-!-margin-bottom-0"
        aria-live="polite"
        aria-relevant="additions"
      >
        {tags && (
          <ul className="lbh-body-s govuk-!-margin-bottom-4">
            {tags.map((tag, i) => (
              <li className={s.tag} key={i}>
                {tag}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setFieldValue(
                      name,
                      tags.filter(existingTag => existingTag !== tag)
                    )
                  }}
                >
                  <span className="govuk-visually-hidden">Remove</span>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path
                      d="M-0.0501709 1.36379L1.36404 -0.050415L12.6778 11.2633L11.2635 12.6775L-0.0501709 1.36379Z"
                      fill="#0B0C0C"
                    />
                    <path
                      d="M11.2635 -0.050293L12.6778 1.36392L1.36404 12.6776L-0.0501709 11.2634L11.2635 -0.050293Z"
                      fill="#0B0C0C"
                    />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div {...getComboboxProps()} className={cx(s.combobox, className)}>
        <input
          className={cx(`govuk-input lbh-input`, s.input)}
          aria-describedby={hint ? `${name}-hint` : undefined}
          onClick={() => toggleMenu()}
          {...getInputProps()}
        />
        <button
          {...getToggleButtonProps()}
          aria-label="toggle menu"
          className={s.button}
        >
          <svg width="17" height="10" viewBox="0 0 17 10" fill="none">
            <path d="M2 1.5L8.5 7.5L15 1.5" stroke="#0B0C0C" strokeWidth="3" />
          </svg>
        </button>

        <ul {...getMenuProps()} className={s.list}>
          {isOpen && (
            <>
              {items.length > 0 ? (
                items.map((item, index) => (
                  <li
                    className={s.option}
                    key={`${item}${index}`}
                    {...getItemProps({ item, index })}
                  >
                    {item}
                  </li>
                ))
              ) : (
                <li
                  className={s.option}
                  {...getItemProps({ item: inputValue, index: 0 })}
                >
                  <span className={s.createPrompt}>
                    Create {itemName} &quot;
                  </span>
                  {inputValue}
                  <span className={s.createPrompt}>&quot;</span>
                </li>
              )}
            </>
          )}
        </ul>
      </div>
    </div>
  )
}

export default Field
