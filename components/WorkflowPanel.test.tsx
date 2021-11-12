import { render, screen } from "@testing-library/react"
import {
  mockWorkflow,
  mockAuthorisedWorkflow,
  mockManagerApprovedWorkflowWithExtras,
  mockAuthorisedWorkflowWithExtras,
  mockWorkflowWithExtras,
} from "../fixtures/workflows"
import WorkflowPanel, { WorkflowForPanel } from "./WorkflowPanel"
import swr from "swr"
import { mockResident } from "../fixtures/residents"
import { useSession } from "next-auth/client"
import { mockUser } from "../fixtures/users"
import { Team } from ".prisma/client"

jest.mock("next-auth/client")
;(useSession as jest.Mock).mockReturnValue([{ user: mockUser }, false])

jest.mock("swr")
;(swr as jest.Mock).mockReturnValue({
  data: mockResident,
})

global.fetch = jest.fn()

const submittedAndUnpprovedWorkflow = {
  ...mockWorkflowWithExtras,
  submittedAt: "2021-08-04T10:11:40.593Z",
  submittedBy: "submitted.by@hackney.gov.uk",
  submitter: {
    ...mockUser,
    name: "Foo Bar",
    email: "submitted.by@hackney.gov.uk",
  },
  managerApprovedAt: null,
  managerApprovedBy: null,
  panelApprovedAt: null,
  panelApprovedBy: null,
} as unknown as WorkflowForPanel

describe("Header", () => {
  it("displays the name of the resident", () => {
    render(
      <WorkflowPanel
        workflow={{
          ...mockWorkflowWithExtras,
          type: "Review",
        }}
      />
    )

    expect(screen.getByText("Firstname Surname")).toBeInTheDocument()
  })

  it("displays a Review tag if a reassessment", () => {
    render(
      <WorkflowPanel
        workflow={{
          ...mockWorkflowWithExtras,
          type: "Reassessment",
        }}
      />
    )

    expect(screen.getByText("Reassessment")).toBeInTheDocument()
  })

  it("displays a Historic tag if historic", () => {
    render(
      <WorkflowPanel
        workflow={{
          ...mockWorkflowWithExtras,
          type: "Historic",
        }}
      />
    )

    expect(screen.getByText("Historic")).toBeInTheDocument()
  })
})

describe("Meta data - assignment", () => {
  beforeEach(() => {
    ;(useSession as jest.Mock).mockClear()
    ;(useSession as jest.Mock).mockReturnValue([{ user: mockUser }, false])
  })

  it("shows the workflow is unassigned if no assignee", () => {
    render(
      <WorkflowPanel
        workflow={{
          ...mockWorkflowWithExtras,
          assignedTo: null,
          assignee: null,
          teamAssignedTo: null,
        }}
      />
    )

    expect(screen.getByText("Unassigned", { exact: false })).toBeInTheDocument()
  })

  it("shows the workflow is assigned if assignee", () => {
    const assignee = {
      ...mockUser,
      name: "Jane Doe",
      email: "jane.doe@example.com",
    }

    render(
      <WorkflowPanel
        workflow={{
          ...mockWorkflowWithExtras,
          assignee,
          assignedTo: assignee.email,
          teamAssignedTo: null,
        }}
      />
    )

    expect(
      screen.getByText("Assigned to Jane Doe", { exact: false })
    ).toBeInTheDocument()
  })

  it("shows the workflow is assigned to a team if no assignee but assigned to a team", () => {
    ;(useSession as jest.Mock).mockReturnValue([
      { user: { ...mockUser, team: Team.CareManagement } },
      false,
    ])

    render(
      <WorkflowPanel
        workflow={{
          ...mockWorkflowWithExtras,
          assignedTo: null,
          assignee: null,
          teamAssignedTo: Team.Access,
        }}
      />
    )

    expect(
      screen.getByText("Assigned to Access team", { exact: false })
    ).toBeInTheDocument()
  })

  it("shows the assignee if submitted workflow", () => {
    ;(useSession as jest.Mock).mockReturnValue([
      { user: { ...mockUser, team: Team.CareManagement } },
      false,
    ])

    render(
      <WorkflowPanel
        workflow={{
          ...submittedAndUnpprovedWorkflow,
          assignedTo: "jane.doe@example.com",
        }}
      />
    )

    expect(screen.queryByText("Assigned to", { exact: false })).toBeVisible()
  })

  it("doesn't show the assignee if authorised workflow", () => {
    render(
      <WorkflowPanel
        workflow={mockAuthorisedWorkflowWithExtras as WorkflowForPanel}
      />
    )

    expect(
      screen.queryByText("Assigned to", { exact: false })
    ).not.toBeInTheDocument()
  })

  it("doesn't show the assignee or unassigned if current user is assigned to the workflow", () => {
    ;(useSession as jest.Mock).mockReturnValue([{ user: mockUser }, false])

    render(
      <WorkflowPanel
        workflow={
          {
            ...mockManagerApprovedWorkflowWithExtras,
            assignee: mockUser,
            assignedTo: mockUser.email,
            teamAssignedTo: null,
          } as WorkflowForPanel
        }
      />
    )

    expect(
      screen.queryByText("Assigned to", { exact: false })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText("Unassigned", { exact: false })
    ).not.toBeInTheDocument()
  })

  it("doesn't show the assignee if in-progress workflow and created by is the same as the assigned to", () => {
    render(
      <WorkflowPanel
        workflow={
          {
            ...mockWorkflow,
            createdBy: "jane.doe@example.com",
            assignedTo: "jane.doe@example.com",
          } as WorkflowForPanel
        }
      />
    )

    expect(
      screen.queryByText("Assigned to", { exact: false })
    ).not.toBeInTheDocument()
  })
})

describe("Meta data - urgent", () => {
  it("shows urgent workflows", () => {
    render(
      <WorkflowPanel
        workflow={
          {
            ...mockWorkflowWithExtras,
            heldAt: "2021-08-04T10:11:40.593Z",
          } as unknown as WorkflowForPanel
        }
      />
    )

    expect(screen.getByText("Urgent", { exact: false })).toBeInTheDocument()
  })
})

describe("Meta data - reassess before", () => {
  it("shows when the workflow is due for reassessment if relevant", () => {
    render(
      <WorkflowPanel
        workflow={
          {
            ...mockWorkflowWithExtras,
            reviewBefore: "2030-08-04T10:11:40.593Z",
            panelApprovedAt: "2021-08-04T10:11:40.593Z",
            nextReview: null,
          } as unknown as WorkflowForPanel
        }
      />
    )

    expect(
      screen.getByText("Reassess before 4 Aug 2030", { exact: false })
    ).toBeInTheDocument()
  })
})

describe("Meta data - comments", () => {
  it("shows the number of comments", () => {
    render(<WorkflowPanel workflow={mockWorkflowWithExtras} />)

    expect(screen.getByText("1 comment", { exact: false })).toBeInTheDocument()
  })
})

describe("Meta data - started by", () => {
  it("shows the name of creator if in progress workflow", () => {
    render(<WorkflowPanel workflow={mockWorkflowWithExtras} />)

    expect(
      screen.getByText("Started by Firstname Surname", { exact: false })
    ).toBeInTheDocument()
  })

  it("shows when it was created", () => {
    render(
      <WorkflowPanel
        workflow={
          {
            ...mockWorkflowWithExtras,
            createdAt: "2021-08-04T10:11:40.593Z",
          } as unknown as WorkflowForPanel
        }
      />
    )

    expect(
      screen.getByText("on 4 Aug 2021", { exact: false })
    ).toBeInTheDocument()
  })

  it("shows 'by me' if current user is creator", () => {
    render(
      <WorkflowPanel
        workflow={
          {
            ...mockWorkflowWithExtras,
            createdAt: "2021-08-04T10:11:40.593Z",
            createdBy: mockUser.email,
            creator: mockUser,
          } as unknown as WorkflowForPanel
        }
      />
    )

    expect(
      screen.getByText("Started by me on 4 Aug 2021", { exact: false })
    ).toBeInTheDocument()
  })

  it("shows the email of creator if a name isn't available", () => {
    render(
      <WorkflowPanel
        workflow={{
          ...mockWorkflowWithExtras,
          creator: {
            ...mockUser,
            name: null,
            email: "created.by@hackney.gov.uk",
          },
          createdBy: "created.by@hackney.gov.uk",
        }}
      />
    )

    expect(
      screen.getByText("Started by created.by@hackney.gov.uk", {
        exact: false,
      })
    ).toBeInTheDocument()
  })

  it("doesn't show creator if submitted workflow", () => {
    render(<WorkflowPanel workflow={submittedAndUnpprovedWorkflow} />)

    expect(
      screen.queryByText("Started by", { exact: false })
    ).not.toBeInTheDocument()
  })
})

describe("Meta data - submitted by", () => {
  it("shows the name of submitter", () => {
    render(<WorkflowPanel workflow={submittedAndUnpprovedWorkflow} />)

    expect(
      screen.getByText("Submitted by Foo Bar", { exact: false })
    ).toBeInTheDocument()
  })

  it("shows when it was submitted", () => {
    render(<WorkflowPanel workflow={submittedAndUnpprovedWorkflow} />)

    expect(
      screen.getByText("on 4 Aug 2021", { exact: false })
    ).toBeInTheDocument()
  })

  it("shows 'by me' if current user is submitter", () => {
    render(
      <WorkflowPanel
        workflow={{
          ...submittedAndUnpprovedWorkflow,
          submitter: mockUser,
          submittedBy: mockUser.email,
        }}
      />
    )

    expect(
      screen.getByText("Submitted by me on 4 Aug 2021", { exact: false })
    ).toBeInTheDocument()
  })

  it("shows the email of submitter if a name isn't available", () => {
    render(
      <WorkflowPanel
        workflow={{
          ...submittedAndUnpprovedWorkflow,
          submitter: {
            ...mockUser,
            name: null,
            email: "submitted.by@hackney.gov.uk",
          },
        }}
      />
    )

    expect(
      screen.getByText("Submitted by submitted.by@hackney.gov.uk", {
        exact: false,
      })
    ).toBeInTheDocument()
  })

  it("doesn't show submitter if unsubmitted workflow", () => {
    render(
      <WorkflowPanel
        workflow={{ ...mockWorkflowWithExtras, submitter: null }}
      />
    )

    expect(
      screen.queryByText("Submitted by", {
        exact: false,
      })
    ).not.toBeInTheDocument()
  })
})

describe("Meta data - approved by", () => {
  it("shows the name of approver", () => {
    render(
      <WorkflowPanel
        workflow={{
          ...mockManagerApprovedWorkflowWithExtras,
          managerApprover: {
            ...mockUser,
            name: "Jane Doe",
            email: "jane.doe@example.com",
          },
          managerApprovedBy: "jane.doe@example.com",
          needsPanelApproval: false,
        }}
      />
    )

    expect(
      screen.getByText("Approved by Jane Doe", {
        exact: false,
      })
    ).toBeInTheDocument()
  })

  it("shows when it was approved", () => {
    render(
      <WorkflowPanel
        workflow={
          {
            ...mockManagerApprovedWorkflowWithExtras,
            managerApprovedAt: "2021-08-04T10:11:40.593Z",
            needsPanelApproval: false,
          } as unknown as WorkflowForPanel
        }
      />
    )

    expect(
      screen.getByText("on 4 Aug 2021", { exact: false })
    ).toBeInTheDocument()
  })

  it("shows the email of approver if a name isn't available", () => {
    render(
      <WorkflowPanel
        workflow={{
          ...mockManagerApprovedWorkflowWithExtras,
          managerApprover: {
            ...mockUser,
            name: null,
            email: "jane.doe@example.com",
          },
          managerApprovedBy: "jane.doe@example.com",
          needsPanelApproval: false,
        }}
      />
    )

    expect(
      screen.getByText("Approved by jane.doe@example.com", {
        exact: false,
      })
    ).toBeInTheDocument()
  })

  it("shows 'by me' if current user is approver", () => {
    render(
      <WorkflowPanel
        workflow={
          {
            ...mockManagerApprovedWorkflowWithExtras,
            managerApprovedBy: mockUser.email,
            managerApprovedAt: "2021-08-04T10:11:40.593Z",
            needsPanelApproval: false,
          } as unknown as WorkflowForPanel
        }
      />
    )

    expect(
      screen.getByText("Approved by me on 4 Aug 2021", { exact: false })
    ).toBeInTheDocument()
  })

  it("doesn't show approver if unsubmitted workflow", () => {
    render(<WorkflowPanel workflow={mockWorkflowWithExtras} />)

    expect(
      screen.queryByText("Approved by", { exact: false })
    ).not.toBeInTheDocument()
  })
})

describe("Meta data - authorised by", () => {
  it("shows the name of authoriser", () => {
    render(
      <WorkflowPanel
        workflow={
          {
            ...mockAuthorisedWorkflow,
            panelApprover: {
              ...mockUser,
              name: "Jane Doe",
              email: "jane.doe@example.com",
            },
            panelApprovedBy: "jane.doe@example.com",
            panelApprovedAt: new Date(),
          } as WorkflowForPanel
        }
      />
    )

    expect(
      screen.getByText("Authorised by Jane Doe", {
        exact: false,
      })
    ).toBeInTheDocument()
  })

  it("shows when it was authorised", () => {
    render(
      <WorkflowPanel
        workflow={
          {
            ...mockAuthorisedWorkflow,
            panelApprovedAt: "2021-08-04T10:11:40.593Z",
          } as unknown as WorkflowForPanel
        }
      />
    )

    expect(
      screen.getByText("on 4 Aug 2021", { exact: false })
    ).toBeInTheDocument()
  })

  it("shows the email of authoriser if a name isn't available", () => {
    render(
      <WorkflowPanel
        workflow={
          {
            ...mockAuthorisedWorkflow,
            panelApprovedBy: "approved.by@hackney.gov.uk",
            panelApprovedAt: new Date(),
          } as WorkflowForPanel
        }
      />
    )

    expect(
      screen.getByText("Authorised by approved.by@hackney.gov.uk", {
        exact: false,
      })
    ).toBeInTheDocument()
  })

  it("shows 'by me' if current user is authoriser", () => {
    render(
      <WorkflowPanel
        workflow={
          {
            ...mockAuthorisedWorkflow,
            panelApprovedBy: mockUser.email,
            panelApprovedAt: "2021-08-04T10:11:40.593Z",
          } as unknown as WorkflowForPanel
        }
      />
    )

    expect(
      screen.getByText("Authorised by me on 4 Aug 2021", { exact: false })
    ).toBeInTheDocument()
  })

  it("doesn't show authorised by if unauthorised workflow", () => {
    render(<WorkflowPanel workflow={mockWorkflowWithExtras} />)

    expect(
      screen.queryByText("Authorised by", { exact: false })
    ).not.toBeInTheDocument()
  })

  it("doesn't show authorised by if skipped QAM workflow", () => {
    render(
      <WorkflowPanel
        workflow={{
          ...mockWorkflowWithExtras,
          managerApprovedAt: new Date(),
          needsPanelApproval: false,
        }}
      />
    )

    expect(
      screen.queryByText("Authorised by", { exact: false })
    ).not.toBeInTheDocument()
  })
})

describe("Progress", () => {
  it("shows the percentage of completeness", () => {
    render(<WorkflowPanel workflow={mockWorkflowWithExtras} />)

    expect(screen.getByText("0%")).toBeInTheDocument()
    expect(screen.getByText("In progress")).toBeInTheDocument()
  })
})
