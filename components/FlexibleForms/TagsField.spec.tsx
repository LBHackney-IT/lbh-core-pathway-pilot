import TagsField from "./TagsField"
import { Formik, Form } from "formik"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"

const choices = [
  { label: "Unit meeting note", value: "Unit meeting note" },
  { label: "Allocation record", value: "Allocation record" },
  { label: "Case audit", value: "Case audit" },
  { label: "Clinical input", value: "Clinical input" },
]

const mockSubmit = jest.fn()

describe("TagsField", () => {
  it("renders correctly", () => {
    render(
      <Formik
        onSubmit={mockSubmit}
        initialValues={{
          foo: [],
        }}
      >
        {({ touched, errors }) => (
          <Form>
            <TagsField
              choices={choices}
              touched={touched}
              errors={errors}
              name="foo"
              label="Label text"
              hint="Hint text"
            />
          </Form>
        )}
      </Formik>
    )
    expect(screen.getByRole("textbox"))
    expect(screen.getByText("Label text"))
    expect(screen.getByText("Hint text"))
  })

  it("lets you add a tag", () => {
    render(
      <Formik
        onSubmit={mockSubmit}
        initialValues={{
          foo: [],
        }}
      >
        {({ touched, errors }) => (
          <Form>
            <TagsField
              choices={choices}
              touched={touched}
              errors={errors}
              name="foo"
              label="Label text"
            />
          </Form>
        )}
      </Formik>
    )
    expect(screen.getByRole("textbox"))
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Correspondence" },
    })
    fireEvent.click(screen.getByText("Correspondence"))

    waitFor(() => {
      expect(screen.getByText("Correspondence"))
      expect(screen.getByText("Remove"))
    })
  })

  it("lets you remove a tag", () => {
    render(
      <Formik
        onSubmit={mockSubmit}
        initialValues={{
          foo: ["bar"],
        }}
      >
        {({ touched, errors }) => (
          <Form>
            <TagsField
              choices={choices}
              touched={touched}
              errors={errors}
              name="foo"
              label="Label text"
            />
          </Form>
        )}
      </Formik>
    )
    expect(screen.getByText("bar"))
    fireEvent.click(screen.getByText("Remove"))
    expect(screen.queryAllByText("bar").length).toBe(0)
  })

  it("renders errors", () => {
    render(
      <Formik
        onSubmit={mockSubmit}
        initialValues={{
          foo: [],
        }}
        initialErrors={{
          foo: "Example error",
        }}
        initialTouched={{
          foo: true as unknown as never[],
        }}
      >
        {({ touched, errors }) => (
          <TagsField
            choices={choices}
            touched={touched}
            errors={errors}
            name="foo"
            label="Label text"
          />
        )}
      </Formik>
    )
    expect(screen.getByText("Example error"))
  })
})
