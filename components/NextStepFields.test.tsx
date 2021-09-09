import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { mockWorkflow } from "../fixtures/workflows"
import NextStepFields from "./NextStepFields"
import nextStepOptions from "../config/nextSteps/nextStepOptions"
import { Formik } from "formik"

describe("NextStepFields", () => {
  it("renders a list of next steps", () => {
    render(
      <Formik initialValues={{}} onSubmit={jest.fn()}>
        <NextStepFields workflow={mockWorkflow} />
      </Formik>
    )
    expect(screen.getAllByRole("checkbox").length).toBe(
      nextStepOptions.filter(o => o.formIds.includes(mockWorkflow.formId))
        .length
    )
  })

  it("renders social care ID field if a relevant step is checked", async () => {
    render(
      <Formik
        initialValues={{
          nextSteps: [],
        }}
        onSubmit={jest.fn()}
      >
        <NextStepFields workflow={mockWorkflow} />
      </Formik>
    )
    expect(screen.queryByLabelText("Social care ID")).toBeNull()
    await waitFor(() =>
      fireEvent.click(
        screen.getByLabelText(
          nextStepOptions.find(o => o.createForDifferentPerson).title
        )
      )
    )
    expect(screen.getByLabelText("Social care ID"))
  })

  it("renders handover note field if a relevant step is checked", async () => {
    render(
      <Formik
        initialValues={{
          nextSteps: [],
        }}
        onSubmit={jest.fn()}
      >
        <NextStepFields workflow={mockWorkflow} />
      </Formik>
    )
    expect(
      screen.queryByLabelText("Why is this necessary?", { exact: false })
    ).toBeNull()
    await waitFor(() =>
      fireEvent.click(
        screen.getByLabelText(nextStepOptions.find(o => o.handoverNote).title)
      )
    )
    expect(screen.getByLabelText("Why is this necessary?", { exact: false }))
  })

  it("renders errors", async () => {
    render(
      <Formik
        initialValues={{
          nextSteps: [{ nextStepOptionId: "foo", note: "", socialCareId: "" }],
        }}
        initialErrors={{
          nextSteps: [{ note: "Foo error" }],
        }}
        initialTouched={{
          nextSteps: [{ note: true }],
        }}
        onSubmit={jest.fn()}
      >
        <NextStepFields workflow={mockWorkflow} />
      </Formik>
    )
    expect(screen.getByText("Foo error"))
  })
})
