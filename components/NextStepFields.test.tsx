import { render, screen } from "@testing-library/react"
import { mockWorkflow as rawMockWorkflow } from "../fixtures/workflows"
import NextStepFields from "./NextStepFields"
import nextStepOptions from "../config/nextSteps/nextStepOptions"
import { Formik } from "formik"

const mockWorkflow = {
  ...rawMockWorkflow,
  formId: "carers-assessment",
}

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

  // it("renders social care ID field if a relevant step is checked", () => {
  //   render(
  //     <Formik initialValues={{}} onSubmit={jest.fn()}>
  //       <NextStepFields workflow={mockWorkflow} />
  //     </Formik>
  //   )
  //   expect(screen.queryByLabelText("Social care ID")).toBeNull()
  //   fireEvent.click(
  //     screen.getByLabelText(
  //       nextStepOptions.find(o => o.createForDifferentPerson).title
  //     )
  //   )
  //   expect(screen.getByLabelText("Social care ID"))
  // })

  // it("renders handover note field if a relevant step is checked", () => {
  //   render(
  //     <Formik initialValues={{}} onSubmit={jest.fn()}>
  //       <NextStepFields workflow={mockWorkflow} />
  //     </Formik>
  //   )
  //   expect(screen.queryByLabelText("Why is this necessary?")).toBeNull()
  //   fireEvent.click(
  //     screen.getByLabelText(nextStepOptions.find(o => o.handoverNote).title)
  //   )
  //   expect(screen.getByLabelText("Why is this necessary?"))
  // })

  // it("renders errors", () => {
  //   render(
  //     <Formik initialValues={{}} onSubmit={jest.fn()} initialErrors={{

  //     }}>
  //       <NextStepFields workflow={mockWorkflow} />
  //     </Formik>
  //   )
  // })
})
