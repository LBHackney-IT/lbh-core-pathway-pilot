import { render } from "@testing-library/react"
import { mockWorkflow } from "../fixtures/workflows"
import NextStepFields from "./NextStepFields"

describe("NextStepFields", () => {
  it("renders a list of next steps", () => {
    render(<NextStepFields workflow={mockWorkflow} errors={{}} touched={{}} />)
  })

  it("renders social care ID and handover note fields if needed", () => {
    render(<NextStepFields workflow={mockWorkflow} errors={{}} touched={{}} />)
  })

  it("renders errors", () => {
    render(<NextStepFields workflow={mockWorkflow} errors={{}} touched={{}} />)
  })
})
