import { Team } from "@prisma/client"
import { mockWorkflow } from "../fixtures/workflows"
import { filterWorkflowsForTeam } from "./teams"
import forms from "../config/forms"

jest.mock(
  "../config/forms",
  () => [
    {
      id: "foo",
      teams: ["one"],
    },
    {
      id: "bar",
      teams: ["two"],
    },
  ],
  { virtual: true }
)

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
      "one" as Team
    )
    expect(result.length).toBe(1)
  })

  it("returns nothing for a non-matching team", () => {
    const result = filterWorkflowsForTeam(
      [mockWorkflow, mockWorkflow],
      "two" as Team
    )
    expect(result.length).toBe(0)
  })
})
