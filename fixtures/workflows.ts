import { Workflow } from "@prisma/client"
import teams from "../config/teams"
import { mockUser } from "./users"

export const mockWorkflow: Workflow = {
  id: "123abc",
  type: "Full",
  assessmentElements: ["OccupationalTherapy", "Sensory"],
  createdAt: new Date("October 13, 2020 14:00:00"),
  createdBy: "foo.bar@hackney.gov.uk",
  assignedTo: "foo.bar@hackney.gov.uk",
  assignedTeam: teams[0],
  updatedAt: new Date("October 13, 2020 14:00:00"),
  updatedBy: "foo.bar@hackney.gov.uk",
  answers: {},
  socialCareId: "123",
  workflowId: null,
  reviewedThemes: [],
  submittedAt: null,
  submittedBy: null,
  managerApprovedAt: null,
  managerApprovedBy: null,
  panelApprovedAt: null,
  panelApprovedBy: null,
  discardedAt: null,
  discardedBy: null,
  heldAt: null,
  assessmentPackageUrl: null,
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
