import { fireEvent, render, screen } from "@testing-library/react"
import { Formik } from "formik"
import FormStatusMessage from "./FormStatusMessage"

describe("FormStatusMessage", () => {
  it("shows nothing initially", () => {
    render(
      <Formik initialValues={{}} onSubmit={jest.fn()}>
        <FormStatusMessage />
      </Formik>
    )
    expect(screen.queryByRole("alert")).toBeNull()
  })

  it("renders the text of a status", () => {
    render(
      <Formik initialValues={{}} onSubmit={jest.fn()}>
        {({ setStatus }) => (
          <>
            <button type="submit" onClick={() => setStatus("test error")} />
            <FormStatusMessage />
          </>
        )}
      </Formik>
    )
    fireEvent.click(screen.getByRole("button"))
    expect(screen.getByRole("alert"))
    expect(screen.getByText("test error"))
  })
})
