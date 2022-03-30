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
      formId: {not: {in: []}}
    })
  })

  it("correctly filters submitted for approval when nonApprovableFormIds passed in", () => {
    const nonApprovableFormIds = ["name1", "name2", "name3"]
    const result = filterByStatus(Status.Submitted, nonApprovableFormIds)
    expect(result).toStrictEqual({
      submittedAt: { not: null },
      managerApprovedAt: null,
      formId: {not: {in: nonApprovableFormIds}}
    })
  })

  it("correctly filters manager approved", () => {
    const result = filterByStatus(Status.ManagerApproved)
    expect(result).toStrictEqual({
      type: { not: "Historic" },
      panelApprovedAt: null,
      managerApprovedAt: { not: null },
      needsPanelApproval: true,
    })
  })

  it("correctly filters no action/panel approved", () => {
    const result = filterByStatus(Status.NoAction)
    expect(result).toEqual({
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
        {
          needsPanelApproval: false,
          managerApprovedAt: { not: null },
          reviewBefore: {
            gte: new Date("2021-01-14T00:00:00.000Z"),
          },
        },
        {
          needsPanelApproval: false,
          managerApprovedAt: { not: null },
          reviewBefore: null,
        },
        {
          type: "Historic",
          reviewBefore: {
            gte: new Date("2021-01-14T00:00:00.000Z"),
          },
        },
        {
          type: "Historic",
          reviewBefore: null,
        },
        {
          formId: {in: []},
          submittedAt: { not: null }
        }
      ],
    })
  })

  it("correctly filters no action/panel approved when nonApprovableFormIds passed in", () => {
    const nonApprovableFormIds = ["name1", "name2", "name3"]
    const result = filterByStatus(Status.NoAction, nonApprovableFormIds)
    expect(result).toEqual({
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
        {
          needsPanelApproval: false,
          managerApprovedAt: { not: null },
          reviewBefore: {
            gte: new Date("2021-01-14T00:00:00.000Z"),
          },
        },
        {
          needsPanelApproval: false,
          managerApprovedAt: { not: null },
          reviewBefore: null,
        },
        {
          type: "Historic",
          reviewBefore: {
            gte: new Date("2021-01-14T00:00:00.000Z"),
          },
        },
        {
          type: "Historic",
          reviewBefore: null,
        },
        {
          formId: {in: nonApprovableFormIds},
          submittedAt: { not: null }
        }
      ],
    })
  })

  it("correctly filters overdue", () => {
    const result = filterByStatus(Status.Overdue)
    expect(result).toStrictEqual({
      reviewBefore: {
        lte: new Date("2020-12-14T00:00:00.000Z"),
      },
    })
  })

  it("correctly filters review soon", () => {
    const result = filterByStatus(Status.ReviewSoon)
    expect(result).toStrictEqual({
      reviewBefore: {
        gte: new Date("2020-12-14T00:00:00.000Z"),
        lte: new Date("2021-01-14T00:00:00.000Z"),
      },
    })
  })
})
