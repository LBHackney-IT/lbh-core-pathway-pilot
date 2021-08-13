import { mockWorkflow } from "../fixtures/workflows"
import { numericStage, stage } from "./stage"

describe("stage", () => {
  it("handles a brand new workflow", () => {
    const result = stage(mockWorkflow)
    expect(result).toBe("In progress")
  })

  it("handles a submitted, unapproved workflow", () => {
    const result = stage({
      ...mockWorkflow,
      submittedAt: "2021-08-04T10:11:40.593Z" as unknown as Date,
    })
    expect(result).toBe("Submitted for approval")
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
    expect(result).toBe("No action needed")
  })

  it("handles an approved workflow with a review that isn't due soon", () => {
    jest
      .spyOn(global.Date, "now")
      .mockImplementation(() => new Date("2020-12-14T11:01:58.135Z").valueOf())

    const result = stage({
      ...mockWorkflow,
      reviewBefore: "2021-08-04T10:11:40.593Z" as unknown as Date,
      panelApprovedAt: "2021-08-04T10:11:40.593Z" as unknown as Date,
    })
    expect(result).toBe("No action needed")
  })

  it("handles an approved workflow with a review that is due soon", () => {
    jest
      .spyOn(global.Date, "now")
      .mockImplementation(() => new Date("2021-08-01T10:11:40.593Z").valueOf())

    const result2 = stage({
      ...mockWorkflow,
      // due in 4 days
      reviewBefore: "2021-08-04T10:11:40.593Z" as unknown as Date,
      panelApprovedAt: "2021-08-04T10:11:40.593Z" as unknown as Date,
    })
    expect(result2).toBe("Review due in 3 days")
  })

  it("handles a discarded workflow", () => {
    const result = stage({
      ...mockWorkflow,
      discardedAt: "2021-08-04T10:11:40.593Z" as unknown as Date,
    })
    expect(result).toBe("Discarded")
  })
})

describe("numericStage", () => {
  it("handles a brand new workflow", () => {
    const result = numericStage(mockWorkflow)
    expect(result).toBe(1)
  })

  it("handles a manager-approved workflow", () => {
    const result = numericStage({
      ...mockWorkflow,
      managerApprovedAt: "2021-08-04T10:11:40.593Z" as unknown as Date,
    })
    expect(result).toBe(2)
  })

  it("handles a fully approved workflow", () => {
    const result = numericStage({
      ...mockWorkflow,
      panelApprovedAt: "2021-08-04T10:11:40.593Z" as unknown as Date,
    })
    expect(result).toBe(3)
  })
})
