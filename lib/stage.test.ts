import { mockWorkflow } from "../fixtures/workflows"
import { numericStage, stage } from "./stage"

describe("stage", () => {
  it("handles a brand new workflow", () => {
    const result = stage(mockWorkflow)
    expect(result).toBe("In progress")
  })

  it("handles a discarded workflow", () => {
    const result = stage({
      ...mockWorkflow,
      discardedAt: "2021-08-04T10:11:40.593Z" as unknown as Date,
    })
    expect(result).toBe("Discarded")
  })

  it("handles a screening", () => {
    const result = stage({
      ...mockWorkflow,
      type: "Screening",
    })
    expect(result).toBe("Screening")
  })

  it("handles a manager-approved workflow", () => {
    const result = stage({
      ...mockWorkflow,
      managerApprovedAt: "2021-08-04T10:11:40.593Z" as unknown as Date,
    })
    expect(result).toBe("Approved by manager")
  })

  it("handles a fully-approved workflow", () => {
    const result = stage({
      ...mockWorkflow,
      panelApprovedAt: "2021-08-04T10:11:40.593Z" as unknown as Date,
    })
    expect(result).toBe("Approved by panel")
  })

  it("handles a fully-approved workflow", () => {
    const result = stage({
      ...mockWorkflow,
      submittedAt: "2021-08-04T10:11:40.593Z" as unknown as Date,
    })
    expect(result).toBe("Submitted for approval")
  })
})

describe("numericStage", () => {
  it("handles a screening", () => {
    const result = numericStage({
      ...mockWorkflow,
      type: "Screening",
    })
    expect(result).toBe(1)
  })

  it("handles a brand new workflow", () => {
    const result = numericStage(mockWorkflow)
    expect(result).toBe(2)
  })

  it("handles a manager-approved workflow", () => {
    const result = numericStage({
      ...mockWorkflow,
      managerApprovedAt: "2021-08-04T10:11:40.593Z" as unknown as Date,
    })
    expect(result).toBe(3)
  })

  it("handles a fully approved workflow", () => {
    const result = numericStage({
      ...mockWorkflow,
      panelApprovedAt: "2021-08-04T10:11:40.593Z" as unknown as Date,
    })
    expect(result).toBe(4)
  })
})
