import TextField from "./TextField"
import { Formik, Form } from "formik"
import { render, screen } from "@testing-library/react"

const mockSubmit = jest.fn()

describe("TextField", () => {
  it("renders correctly", () => {
    render(
      <Formik
        onSubmit={mockSubmit}
        initialValues={{
          foo: false,
        }}
      >
        {({ touched, errors }) => (
          <Form>
            <TextField
              touched={touched}
              errors={errors}
              name="foo"
              label="Label text"
              hint="Hint text"
              placeholder="Example placeholder"
            />
          </Form>
        )}
      </Formik>
    )

    expect(screen.getByRole("textbox"))
    expect(screen.getByLabelText("Label text"))
    expect(screen.getByText("Hint text"))
    expect(screen.getByPlaceholderText("Example placeholder"))
  })

  it("accepts an initial value", () => {
    render(
      <Formik
        onSubmit={mockSubmit}
        initialValues={{
          foo: "example initial value",
        }}
      >
        {({ touched, errors }) => (
          <Form>
            <TextField
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
    expect(screen.getByDisplayValue("example initial value"))
  })

  it("renders errors", () => {
    render(
      <Formik
        onSubmit={mockSubmit}
        initialValues={{
          foo: "",
        }}
        initialErrors={{
          foo: "Example error",
        }}
        initialTouched={{
          foo: true,
        }}
      >
        {({ touched, errors }) => (
          <TextField
            touched={touched}
            errors={errors}
            name="foo"
            label="Label text"
            hint="Hint text"
          />
        )}
      </Formik>
    )
    expect(screen.getByText("Example error"))
  })
})
