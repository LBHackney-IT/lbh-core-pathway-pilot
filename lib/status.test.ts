import { WorkflowType } from ".prisma/client"
import { mockWorkflow } from "../fixtures/workflows"
import { Status } from "../types"
import { getStatus, numericStatus, prettyStatus } from "./status"

describe("getStatus", () => {
  it("returns a string from the status enum", () => {
    const result = getStatus(mockWorkflow)
    expect(Object.values(Status).includes(result)).toBeTruthy()
  })
})

describe("prettyStatus", () => {
  it("handles a brand new workflow", () => {
    const result = prettyStatus(mockWorkflow)
    expect(result).toBe("In progress")
  })

  it("handles a submitted, unapproved workflow", () => {
    const result = prettyStatus({
      ...mockWorkflow,
      submittedAt: "2021-08-04T10:11:40.593Z" as unknown as Date,
    })
    expect(result).toBe("Submitted for approval")
  })

  it("handles a manager-approved workflow", () => {
    const result = prettyStatus({
      ...mockWorkflow,
      managerApprovedAt: "2021-08-04T10:11:40.593Z" as unknown as Date,
    })
    expect(result).toBe("Approved by manager")
  })

  it("handles a manager-approved workflow that doesn't need panel approval", () => {
    const result = prettyStatus({
      ...mockWorkflow,
      needsPanelApproval: false,
      managerApprovedAt: "2021-08-04T10:11:40.593Z" as unknown as Date,
    })
    expect(result).toBe("No action needed")
  })

  it("handles a fully-approved workflow", () => {
    const result = prettyStatus({
      ...mockWorkflow,
      panelApprovedAt: "2021-08-04T10:11:40.593Z" as unknown as Date,
    })
    expect(result).toBe("No action needed")
  })

  it("handles an approved and authorised workflow with a review that isn't due soon", () => {
    jest
      .spyOn(global.Date, "now")
      .mockImplementation(() => new Date("2020-12-14T11:01:58.135Z").valueOf())

    const result = prettyStatus({
      ...mockWorkflow,
      reviewBefore: "2021-08-04T10:11:40.593Z" as unknown as Date,
      panelApprovedAt: "2021-08-04T10:11:40.593Z" as unknown as Date,
    })
    expect(result).toBe("No action needed")
  })

  it("handles an approved and authorised workflow with a review that is due soon", () => {
    jest
      .spyOn(global.Date, "now")
      .mockImplementation(() => new Date("2021-08-01T10:11:40.593Z").valueOf())

    const result2 = prettyStatus({
      ...mockWorkflow,
      // due in 4 days
      reviewBefore: "2021-08-04T10:11:40.593Z" as unknown as Date,
      panelApprovedAt: "2021-08-04T10:11:40.593Z" as unknown as Date,
    })
    expect(result2).toBe("Review due in 3 days")
  })

  it("handles a manager-approved workflow that doesn't need panel approval with a review that isn't due soon", () => {
    jest
      .spyOn(global.Date, "now")
      .mockImplementation(() => new Date("2020-12-14T11:01:58.135Z").valueOf())

    const result = prettyStatus({
      ...mockWorkflow,
      needsPanelApproval: false,
      managerApprovedAt: "2021-08-04T10:11:40.593Z" as unknown as Date,
      reviewBefore: "2021-08-04T10:11:40.593Z" as unknown as Date,
    })
    expect(result).toBe("No action needed")
  })

  it("handles a manager-approved workflow that doesn't need panel approval with a review that is due soon", () => {
    jest
      .spyOn(global.Date, "now")
      .mockImplementation(() => new Date("2021-08-01T10:11:40.593Z").valueOf())

    const result2 = prettyStatus({
      ...mockWorkflow,
      needsPanelApproval: false,
      managerApprovedAt: "2021-08-04T10:11:40.593Z" as unknown as Date,
      // due in 4 days
      reviewBefore: "2021-08-04T10:11:40.593Z" as unknown as Date,
    })
    expect(result2).toBe("Review due in 3 days")
  })

  it("handles a discarded workflow", () => {
    const result = prettyStatus({
      ...mockWorkflow,
      discardedAt: "2021-08-04T10:11:40.593Z" as unknown as Date,
    })
    expect(result).toBe("Discarded")
  })

  it("handles a historic workflow with a review that is due soon", () => {
    jest
      .spyOn(global.Date, "now")
      .mockImplementation(() => new Date("2021-08-01T10:11:40.593Z").valueOf())

    const result2 = prettyStatus({
      ...mockWorkflow,
      type: WorkflowType.Historic,
      // due in 4 days
      reviewBefore: "2021-08-04T10:11:40.593Z" as unknown as Date,
    })
    expect(result2).toBe("Review due in 3 days")
  })

  it("handles a historic workflow with a review that isn't due soon", () => {
    const result2 = prettyStatus({
      ...mockWorkflow,
      type: WorkflowType.Historic,
    })
    expect(result2).toBe("No action needed")
  })
})

describe("numericStatus", () => {
  it("handles a brand new workflow", () => {
    const result = numericStatus(mockWorkflow)
    expect(result).toBe(1)
  })

  it("handles a manager-approved workflow", () => {
    const result = numericStatus({
      ...mockWorkflow,
      managerApprovedAt: "2021-08-04T10:11:40.593Z" as unknown as Date,
    })
    expect(result).toBe(2)
  })

  it("handles a fully approved workflow", () => {
    const result = numericStatus({
      ...mockWorkflow,
      panelApprovedAt: "2021-08-04T10:11:40.593Z" as unknown as Date,
    })
    expect(result).toBe(3)
  })
})
