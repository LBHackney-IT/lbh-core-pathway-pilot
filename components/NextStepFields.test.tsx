import { render } from "@testing-library/react"
import { mockWorkflow } from "../fixtures/workflows"
import NextStepFields from "./NextStepFields"

describe("todo", () => {
  it("works", () => {
    render(<NextStepFields workflow={mockWorkflow} errors={{}} touched={{}} />)
  })
})
