import { Team } from "@prisma/client"
import { mockWorkflow } from "../fixtures/workflows"
import { Form } from "../types"
import { filterWorkflowsForTeam } from "./teams"

const mockForms = [
  {
    id: "foo",
    teams: ["one"],
  },
  {
    id: "bar",
    teams: ["two"],
  },
]

describe("filterWorkflowsByTeam", () => {
  it("filters the list for a valid team", () => {
    const result = filterWorkflowsForTeam(
      [
        {
          ...mockWorkflow,
          formId: "foo",
        },
        {
          ...mockWorkflow,
          formId: "bar",
        },
      ],
      "one" as Team,
      mockForms as Form[]
    )
    expect(result.length).toBe(1)
  })

  it("returns nothing for a non-matching team", () => {
    const result = filterWorkflowsForTeam(
      [mockWorkflow, mockWorkflow],
      "two" as Team,
      mockForms as Form[]
    )
    expect(result.length).toBe(0)
  })
})
