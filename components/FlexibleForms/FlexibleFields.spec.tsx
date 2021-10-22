import FlexibleFields from "./FlexibleFields"
import { Formik } from "formik"
import { render, screen } from "@testing-library/react"

const mockSubmit = jest.fn()

const mockChoices = [
  {
    value: "bar",
    label: "Bar",
  },
]

describe("FlexibleFields", () => {
  it("returns all supported field types", () => {
    render(
      <Formik onSubmit={mockSubmit} initialValues={{}}>
        <>
          <FlexibleFields
            field={{ id: "foo", question: "", type: "text" }}
            values={{}}
            touched={{}}
            errors={{}}
          />
          <FlexibleFields
            field={{ id: "foo", question: "", type: "textarea" }}
            values={{}}
            touched={{}}
            errors={{}}
          />
          <FlexibleFields
            field={{ id: "foo", question: "", type: "date" }}
            values={{}}
            touched={{}}
            errors={{}}
          />
          <FlexibleFields
            field={{ id: "foo", question: "", type: "datetime" }}
            values={{}}
            touched={{}}
            errors={{}}
          />
          <FlexibleFields
            field={{
              id: "foo",
              question: "",
              type: "radios",
              choices: mockChoices,
            }}
            values={{}}
            touched={{}}
            errors={{}}
          />
          <FlexibleFields
            field={{
              id: "foo",
              question: "",
              type: "checkboxes",
              choices: mockChoices,
            }}
            values={{}}
            touched={{}}
            errors={{}}
          />
          <FlexibleFields
            field={{
              id: "foo",
              question: "",
              type: "select",
              choices: mockChoices,
            }}
            values={{}}
            touched={{}}
            errors={{}}
          />

          <FlexibleFields
            field={{ id: "foo", question: "", type: "repeater" }}
            values={{}}
            touched={{}}
            errors={{}}
          />
          <FlexibleFields
            field={{
              id: "foo",
              question: "",
              type: "repeaterGroup",
              subfields: [{ id: "bar", question: "Su", type: "text" }],
            }}
            values={{}}
            touched={{}}
            errors={{}}
          />
          <FlexibleFields
            field={{
              id: "foo",
              question: "",
              type: "combobox",
              choices: mockChoices,
            }}
            values={{}}
            touched={{}}
            errors={{}}
          />
        </>
      </Formik>
    )

    expect(screen.getAllByRole("textbox").length).toBe(5)

    expect(screen.getAllByLabelText("Date").length).toBe(1)
    expect(screen.getAllByLabelText("Time").length).toBe(1)

    expect(screen.getAllByRole("radio").length).toBe(1)
    expect(screen.getAllByRole("checkbox").length).toBe(1)
    expect(screen.getAllByRole("combobox").length).toBe(2)
    expect(screen.getAllByRole("button").length).toBe(5)

    expect(screen.getAllByText("Add another", { exact: false }).length).toBe(2)
  })

  it("renders nothing for an unsupported field type", () => {
    render(
      <Formik onSubmit={mockSubmit} initialValues={{}}>
        <FlexibleFields
          field={{
            id: "foo",
            type: "whatever" as never,
            question: "foo",
          }}
          values={{}}
          touched={{}}
          errors={{}}
        />
      </Formik>
    )
    expect(screen.queryByText("Test label")).toBeNull()
  })

  describe("when a field has conditions", () => {
    it("shows conditional fields when the condition is met", () => {
      render(
        <Formik onSubmit={mockSubmit} initialValues={{}}>
          <FlexibleFields
            field={{
              id: "foo",
              question: "foo",
              type: "text",
              conditions: [
                {
                  id: "bar",
                  value: "yes",
                },
              ],
            }}
            values={{ bar: "yes" }}
            touched={{}}
            errors={{}}
          />
        </Formik>
      )

      expect(screen.getByRole("textbox"))
    })

    it("hides conditional fields when the condition is not met", () => {
      render(
        <Formik onSubmit={mockSubmit} initialValues={{}}>
          <FlexibleFields
            field={{
              id: "foo",
              question: "foo",
              type: "text",
              conditions: [
                {
                  id: "bar",
                  value: "yes",
                },
              ],
            }}
            values={{ bar: "" }}
            touched={{}}
            errors={{}}
          />
        </Formik>
      )

      expect(screen.queryByRole("textbox")).toBeNull()
    })

    it("supports arrays of multiple conditions", () => {
      render(
        <Formik onSubmit={mockSubmit} initialValues={{}}>
          <FlexibleFields
            field={{
              id: "foo",
              question: "foo",
              type: "text",
              conditions: [
                {
                  id: "bar",
                  value: "yes",
                },
                {
                  id: "su",
                  value: "yes",
                },
              ],
            }}
            values={{ bar: "yes", su: "yes" }}
            touched={{}}
            errors={{}}
          />
        </Formik>
      )

      expect(screen.getByRole("textbox"))
    })

    it("deletes the value for a field if one of its conditions aren't met", () => {
      const values = {
        question1: "not the condition value of question 2",
        question2: "some value",
      }

      render(
        <Formik onSubmit={mockSubmit} initialValues={{}}>
          <FlexibleFields
            field={{
              id: "question2",
              question: "Question 2?",
              type: "text",
              conditions: [
                {
                  id: "question1",
                  value: "yes",
                },
              ],
            }}
            values={values}
            touched={{}}
            errors={{}}
          />
        </Formik>
      )

      expect(values).toMatchObject({
        question1: "not the condition value of question 2",
      })
    })

    it("deletes the value for a field if any of its conditions aren't met", () => {
      const values = {
        question1: "yes",
        question2: "not the condition value of question 3",
        question3: "some value",
      }

      render(
        <Formik onSubmit={mockSubmit} initialValues={{}}>
          <FlexibleFields
            field={{
              id: "question3",
              question: "Question 3?",
              type: "text",
              conditions: [
                {
                  id: "question1",
                  value: "yes",
                },
                {
                  id: "question2",
                  value: "yes",
                },
              ],
            }}
            values={values}
            touched={{}}
            errors={{}}
          />
        </Formik>
      )

      expect(values).toMatchObject({
        question1: "yes",
        question2: "not the condition value of question 3",
      })
    })

    it("deletes the value for a field if all of its conditions aren't met", () => {
      const values = {
        question1: "not the condition value of question 3",
        question2: "not the condition value of question 3",
        question3: "some value",
      }

      render(
        <Formik onSubmit={mockSubmit} initialValues={{}}>
          <FlexibleFields
            field={{
              id: "question3",
              question: "Question 3?",
              type: "text",
              conditions: [
                {
                  id: "question1",
                  value: "yes",
                },
                {
                  id: "question2",
                  value: "yes",
                },
              ],
            }}
            values={values}
            touched={{}}
            errors={{}}
          />
        </Formik>
      )

      expect(values).toMatchObject({
        question1: "not the condition value of question 3",
        question2: "not the condition value of question 3",
      })
    })
  })
})
