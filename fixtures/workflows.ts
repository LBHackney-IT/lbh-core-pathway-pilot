import { Workflow } from "@prisma/client"
import { mockUser } from "./users"

export const mockWorkflow: Workflow = {
  id: "123abc",
  type: "Assessment",
  formId: "",
  createdAt: new Date("October 13, 2020 14:00:00"),
  createdBy: "foo.bar@hackney.gov.uk",
  assignedTo: "foo.bar@hackney.gov.uk",
  updatedAt: new Date("October 13, 2020 14:00:00"),
  updatedBy: "foo.bar@hackney.gov.uk",
  answers: {},
  socialCareId: "123",
  workflowId: null,
  reviewBefore: null,
  submittedAt: null,
  submittedBy: null,
  managerApprovedAt: null,
  managerApprovedBy: null,
  panelApprovedAt: null,
  panelApprovedBy: null,
  discardedAt: null,
  discardedBy: null,
  heldAt: null,
}

export const mockWorkflowWithCreator = {
  ...mockWorkflow,
  creator: mockUser,
}

export const mockWorkflowWithCreatorAndAssignee = {
  ...mockWorkflow,
  creator: mockUser,
  assignedTo: "firstname.surname@hackney.gov.uk",
  assignee: mockUser,
}

export const mockWorkflowWithCreatorAssigneeAndUpdater = {
  ...mockWorkflow,
  creator: mockUser,
  assignedTo: "firstname.surname@hackney.gov.uk",
  assignee: mockUser,
  updater: mockUser,
}
