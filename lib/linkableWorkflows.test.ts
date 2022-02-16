import {mockWorkflow} from "../fixtures/workflows";
import {mockForm} from "../fixtures/form";
import {getLinkableWorkflows} from "./linkableWorkflows";

const baseWorkFlows = [
  {...mockWorkflow,
    id: "123",
    createdAt: new Date(
      "January 25, 2022 14:00:00"
    ).toISOString() as unknown as Date,
    updatedAt: null
  },
  {...mockWorkflow,
    id: "456",
    createdAt: new Date(
      "January 25, 2022 14:00:00"
    ).toISOString() as unknown as Date,
    updatedAt: new Date(
      "January 25, 2022 14:00:00"
    ).toISOString() as unknown as Date
  },
  {...mockWorkflow,
    id: "789",
    createdAt: new Date(
      "January 25, 2022 14:00:00"
    ).toISOString() as unknown as Date,
    updatedAt: new Date(
      "February 25, 2022 14:00:00"
    ).toISOString() as unknown as Date
  }
]

const baseForms = [
  {
    ...mockForm,
    id: "123",
    name: "Talking therapy"
  },
  {
    ...mockForm,
    id: "456",
    name: "Counselling"
  },
  {
    ...mockForm,
    id: "789",
    name: "Social group"
  }
]

describe("linkableWorkflows", () => {
  it("Shows all workflows provided if no current workflow ID is supplied", async () => {
    const linkableWorkflows = getLinkableWorkflows(baseWorkFlows, baseForms)
    expect(linkableWorkflows[0].label).toContain("None")
    expect(linkableWorkflows.length).toBe(4)
  })

  it("excludes the current workflow from the list so a workflow cannot link to itself", async () => {
    const linkableWorkflows = getLinkableWorkflows(baseWorkFlows, baseForms, "456")
    expect(linkableWorkflows.length).toBe(3)
  })

  it("returns only 'None' option when the workflows list is empty", async () => {
    const linkableWorkflows = getLinkableWorkflows([], [], "456")
    expect(linkableWorkflows.length).toBe(1)
  })

  it("uses the correct updated date", async () => {
    const linkableWorkflows = getLinkableWorkflows(baseWorkFlows, baseForms)
    expect(linkableWorkflows[1].label).toContain("last edited 25 Jan")
    expect(linkableWorkflows[2].label).toContain("last edited 25 Jan")
    expect(linkableWorkflows[3].label).toContain("last edited 25 Feb")
  })

})