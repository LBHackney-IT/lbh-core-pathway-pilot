import { fireEvent, render, screen } from "@testing-library/react"
import { mockWorkflowWithExtras } from "../fixtures/workflows"
import WorkflowList from "./WorkflowList"
import { useSession } from "next-auth/client"
import { mockUser } from "../fixtures/users"
import { useRouter } from "next/router"
import { Team } from "@prisma/client"

jest.mock("next/router")
;(useRouter as jest.Mock).mockReturnValue({
  push: jest.fn(),
})

jest.mock("next-auth/client")
;(useSession as jest.Mock).mockReturnValue([{ user: mockUser }])

const mockWorkflows = [
  {
    ...mockWorkflowWithExtras,
    assignedTo: "foo.bar@hackney.gov.uk",
  },
  {
    ...mockWorkflowWithExtras,
    teamAssignedTo: Team.LongTermCare,
  },
  mockWorkflowWithExtras,
]

describe("WorkflowList", () => {
  it("behaves when there are no results to show overall", () => {
    render(<WorkflowList workflows={[]} />)
    expect(screen.getByText("No results to show"))
  })

  it("correctly splits results into individual, team and overall lists", () => {
    render(<WorkflowList workflows={mockWorkflows} />)
    expect(screen.getByText("Assigned to me (2)"))
    expect(screen.getByText("Team (2)"))
    expect(screen.getByText("All (3)"))
  })

  it("shows the correct message when there are no results to show on the current tab only", () => {
    ;(useSession as jest.Mock).mockReturnValue([false, false])
    render(<WorkflowList workflows={mockWorkflows} />)
    fireEvent.click(screen.getByText("Team (0)"))
    expect(screen.getByText("No results match your filters."))
  })
})
