import {render, screen} from "@testing-library/react"
import {mockWorkflow, MockWorkflowWithExtras, mockWorkflowWithExtras} from "../fixtures/workflows"
import WorkflowOverviewLayout from "./WorkflowOverviewLayout"
import useResident from "../hooks/useResident"
import {mockResident} from "../fixtures/residents"
import {useRouter} from "next/router"
import {WorkflowForPrimaryAction} from "./PrimaryAction"
import {beforeEach} from "@jest/globals";
import {renderWithSession} from "../lib/auth/test-functions";
import {mockSession, mockSessionApprover} from "../fixtures/session";
import {UserSession} from "../lib/auth/types";
import useForms from "../hooks/useForms";
import {mockForm} from "../fixtures/form";

global.fetch = jest.fn()

jest.mock("next/router")
;(useRouter as jest.Mock).mockReturnValue({
  push: jest.fn(),
})

jest.mock("../hooks/useForms")
;(useForms as jest.Mock).mockReturnValue(mockForm)

jest.mock("../hooks/useResident")
;(useResident as jest.Mock).mockReturnValue({data: mockResident})

const renderWorkflow = (workflow: MockWorkflowWithExtras = mockWorkflowWithExtras, session: UserSession = mockSession) => {
  renderWithSession(
    <WorkflowOverviewLayout
      workflow={workflow}
      nav={<>Navigation Prop</>}
      sidebar={<>Sidebar Prop</>}
      mainContent={<>Main Content Prop</>}
      footer={<>Footer Prop</>}
    />,
    session,
  )
};

const mockWorkflowWithNextWorkflows = {...mockWorkflow, nextWorkflows: []}

describe("components/WorkflowOverviewLayout", () => {
  beforeEach(() => renderWorkflow());


  it("correctly sets the title from the form name", () => {
    expect(screen.getByRole("heading"))
    expect(screen.getByText("Mock form", {exact: false}))
    expect(screen.getByText(`for ${mockResident.firstName} ${mockResident.lastName}`, {exact: false}))
  })

  it("doesn't show secondary actions unless a workflow is in progress", () => {
    render(
      <WorkflowOverviewLayout
        workflow={{
          ...mockWorkflowWithExtras,
          submittedAt: "2021-08-04T10:11:40.593Z" as unknown as Date,
        }}
        nav={<>One</>}
        sidebar={<>Two</>}
        mainContent={<>Three</>}
      />
    )
    expect(screen.queryByText("Close")).toBeNull()
    expect(screen.queryByText("Hold")).toBeNull()
  });

  describe('when a workflow has a status of in progress', () => {
    beforeEach(() => renderWorkflow(mockWorkflowWithNextWorkflows as unknown as MockWorkflowWithExtras));

    it("does not show discard", () => {
      expect(screen.queryByText("Discard")).toBeNull()
    })

    describe('and the user is an approver', () => {
      beforeEach(() => {
        renderWithSession(
          <WorkflowOverviewLayout
            workflow={
              mockWorkflowWithNextWorkflows as unknown as MockWorkflowWithExtras}
            nav={<>Navigation Prop</>}
            sidebar={<>Sidebar Prop</>}
            mainContent={<>Main Content Prop</>}
            footer={<>Footer Prop</>}
          />,
          mockSessionApprover,
        )
      });

      it("shows the discard action", () => {
        expect(screen.queryByText("Discard")).toBeVisible();
      })
    });
  });
  describe('when a workflow has a status of no action', () => {
    beforeEach(() => renderWorkflow({
      ...mockWorkflowWithNextWorkflows,
      managerApprovedAt: new Date(),
      needsPanelApproval: false,
    } as unknown as MockWorkflowWithExtras));

    it("shows the mark urgent action", () => {
      expect(screen.getByText("Mark urgent")).toBeVisible();
    });

    describe('and the user is an approver', () => {
      beforeEach(() => {
        renderWithSession(
          <WorkflowOverviewLayout
            workflow={
              mockWorkflowWithNextWorkflows as unknown as MockWorkflowWithExtras}
            nav={<>Navigation Prop</>}
            sidebar={<>Sidebar Prop</>}
            mainContent={<>Main Content Prop</>}
            footer={<>Footer Prop</>}
          />,
          mockSessionApprover,
        )
      });

      it("shows the discard action", () => {
        expect(screen.queryByText("Discard")).toBeVisible();
      })
    });
  });
  describe('when a workflow is historic', () => {
    beforeEach(() => {
      renderWorkflow({
        ...mockWorkflowWithExtras,
        type: "Historic",
      })
    });

    it("shows the historic label", () => {
      expect(screen.getByText("Historic"))
    })
  });
  describe('when a workflow is a review', () => {
    beforeEach(() => {
      renderWorkflow({
        ...mockWorkflowWithExtras,
        type: "Review",
      })
    });

    it("shows the review label", () => {
      expect(screen.getByText("Review"))
    })
  });
  describe('when a workflow is a reassessment', () => {
    beforeEach(() => {
      renderWorkflow({
        ...mockWorkflowWithExtras,
        type: "Reassessment",
      })
    });

    it("shows the reassessment label", () => {
      expect(screen.getByText("Reassessment"))
    })
  });
  describe('when a workflow is urgent', () => {
    beforeEach(() => {
      renderWorkflow({
        ...mockWorkflowWithExtras,
        heldAt: "2021-08-04T10:11:40.593Z",
      } as unknown as MockWorkflowWithExtras)
    });
    it("shows the urgent label", () => {
      expect(screen.getByText("Urgent"))
    })
    it("shows the remove urgent action", () => {
      expect(screen.queryByText("Remove urgent")).toBeVisible();
    });
  });
  describe('rendering passed react elements', () => {
    it("renders the navigation element", () => {
      expect(screen.getByText("Navigation Prop")).toBeVisible();
    });

    it("renders the sidebar element", () => {
      expect(screen.getByText("Sidebar Prop")).toBeVisible();
    });

    it("renders the main content element", () => {
      expect(screen.getByText("Main Content Prop")).toBeVisible();
    });

    it("renders the footer element", () => {
      expect(screen.getByText("Footer Prop")).toBeVisible();
    });
  });


  describe('when a workflow is discarded', () => {
    it("does not show the discard button", () => {
      render(
        <WorkflowOverviewLayout
          workflow={
            {
              ...mockWorkflowWithExtras,
              discardedAt: "2021-08-04T10:11:40.593Z",
            } as unknown as WorkflowForPrimaryAction
          }
          nav={<>One</>}
          sidebar={<>Two</>}
          mainContent={<>Three</>}
        />
      )
      expect(screen.queryByText("Close")).toBeNull()
    })
  });
})
