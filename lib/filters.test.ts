import { Status } from "../types"
import { filterByStatus } from "./filters"

jest
  .spyOn(global.Date, "now")
  .mockImplementation(() => new Date("2020-12-14T00:00:00.000Z").valueOf())

describe("filterByStatus", () => {
  it("correctly filters discarded", () => {
    const result = filterByStatus(Status.Discarded)
    expect(result).toStrictEqual({ discardedAt: { not: null } })
  })

  it("correctly filters in progress", () => {
    const result = filterByStatus(Status.InProgress)
    expect(result).toStrictEqual({
      submittedAt: null,
      discardedAt: null,
    })
  })

  it("correctly filters submitted for approval", () => {
    const result = filterByStatus(Status.Submitted)
    expect(result).toStrictEqual({
      submittedAt: { not: null },
      managerApprovedAt: null,
    })
  })

  it("correctly filters manager approved", () => {
    const result = filterByStatus(Status.ManagerApproved)
    expect(result).toStrictEqual({
      panelApprovedAt: null,
      managerApprovedAt: { not: null },
    })
  })

  it("correctly filters no action/panel approved", () => {
    const result = filterByStatus(Status.NoAction)
    expect(result).toStrictEqual({
      OR: [
        {
          panelApprovedAt: { not: null },
          reviewBefore: {
            gte: new Date("2021-01-14T00:00:00.000Z"),
          },
        },
        {
          panelApprovedAt: { not: null },
          reviewBefore: null,
        },
      ],
    })
  })

  it("correctly filters overdue", () => {
    const result = filterByStatus(Status.Overdue)
    expect(result).toStrictEqual({})
  })

  it("correctly filters review soon", () => {
    const result = filterByStatus(Status.ReviewSoon)
    expect(result).toStrictEqual({
      reviewBefore: {
        lte: new Date("2021-01-14T00:00:00.000Z"),
      },
    })
  })
})
