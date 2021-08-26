import RepeaterGroupField from "./RepeaterGroupField"
import { Formik } from "formik"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"

const mockSubmit = jest.fn()

describe("RepeaterGroupField", () => {
  it("renders no groups correctly", () => {
    render(
      <Formik
        onSubmit={mockSubmit}
        initialValues={{
          foo: [],
        }}
      >
        <RepeaterGroupField
          name="foo"
          label="Label text"
          hint="Hint text"
          subfields={[
            {
              id: "bar",
              question: "bar",
              type: "text",
            },
          ]}
        />
      </Formik>
    )
    expect(screen.queryByRole("textbox")).toBeNull()

    expect(screen.getAllByText("Label text"))
    expect(screen.getByText("Hint text"))
    expect(screen.getByText("Add item"))
  })

  it("renders initial values correctly", () => {
    render(
      <Formik
        onSubmit={mockSubmit}
        initialValues={{
          foo: [
            {
              bar: "example value",
            },
          ],
        }}
      >
        <RepeaterGroupField
          name="foo"
          label="Label text"
          hint="Hint text"
          subfields={[
            {
              id: "bar",
              question: "bar",
              type: "text",
            },
          ]}
        />
      </Formik>
    )

    expect(screen.getByText("bar"))
    expect(screen.getAllByRole("textbox").length).toBe(1)
    expect(screen.getByDisplayValue("example value"))
  })

  it("renders errors correctly", () => {
    render(
      <Formik
        onSubmit={mockSubmit}
        initialValues={{
          foo: [
            {
              bar: "example value",
            },
          ],
        }}
        initialErrors={{
          foo: "example error 1",
        }}
        initialTouched={{
          foo: [],
        }}
      >
        <RepeaterGroupField
          name="foo"
          label="Label text"
          hint="Hint text"
          subfields={[
            {
              id: "bar",
              question: "bar",
              type: "text",
            },
          ]}
        />
      </Formik>
    )

    expect(screen.getByText("example error 1"))

    render(
      <Formik
        onSubmit={mockSubmit}
        initialValues={{
          foo: [
            {
              bar: "example value",
            },
          ],
        }}
        initialErrors={{
          foo: [
            {
              bar: "example error 2",
            },
          ],
        }}
        initialTouched={{
          foo: [
            {
              bar: true,
            },
          ],
        }}
      >
        <RepeaterGroupField
          name="foo"
          label="Label text"
          hint="Hint text"
          subfields={[
            {
              id: "bar",
              question: "bar",
              type: "text",
            },
          ]}
        />
      </Formik>
    )

    expect(screen.getByText("example error 2"))
  })

  it("allows items to be added and removed", async () => {
    render(
      <Formik
        onSubmit={mockSubmit}
        initialValues={{
          foo: [],
        }}
      >
        <RepeaterGroupField
          name="foo"
          label="Label text"
          hint="Hint text"
          subfields={[
            {
              id: "bar",
              question: "bar",
              type: "text",
            },
          ]}
        />
      </Formik>
    )

    fireEvent.click(screen.getByText("Add item"))
    await waitFor(() => expect(screen.queryAllByRole("textbox").length).toBe(1))

    fireEvent.click(screen.getByText("Add another item"))
    await waitFor(() => expect(screen.queryAllByRole("textbox").length).toBe(2))

    fireEvent.click(screen.getAllByText("Remove")[0])
    await waitFor(() => expect(screen.queryAllByRole("textbox").length).toBe(1))
  })
})
