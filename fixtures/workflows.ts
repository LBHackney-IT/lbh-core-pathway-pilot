import { Team, User, Workflow, NextStep, Comment } from "@prisma/client"
import { Form, RevisionWithActor } from "../types"
import { mockComment } from "./comments"
import { mockForm } from "./form"
import { mockNextStep } from "./nextSteps"
import { mockRevisionWithActor } from "./revisions"
import { mockUser } from "./users"

export const mockWorkflow: Workflow = {
  id: "123abc",
  type: "Assessment",
  formId: "mock-form",
  createdAt: new Date(
    "October 13, 2020 14:00:00"
  ).toISOString() as unknown as Date,
  createdBy: "foo.bar@hackney.gov.uk",
  assignedTo: "foo.bar@hackney.gov.uk",
  teamAssignedTo: Team.Access,
  updatedAt: new Date(
    "October 13, 2020 14:00:00"
  ).toISOString() as unknown as Date,
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
  needsPanelApproval: true,
}

export interface MockWorkflowWithExtras extends Workflow {
  creator: User
  assignee: User
  updater: User
  submitter: User
  managerApprover: User
  panelApprover: User
  discarder: User
  nextReview: Workflow
  previousReview: Workflow
  form: Form
  revisions: RevisionWithActor[]
  nextSteps: NextStep[]
  comments: Comment[]
}

export const mockWorkflowWithExtras: MockWorkflowWithExtras = {
  ...mockWorkflow,
  creator: mockUser,
  assignedTo: "firstname.surname@hackney.gov.uk",
  assignee: mockUser,
  updatedBy: "firstname.surname@hackney.gov.uk",
  updater: mockUser,
  submitter: mockUser,
  discarder: mockUser,
  managerApprover: mockUser,
  panelApprover: mockUser,
  revisions: [
    { ...mockRevisionWithActor, id: "123abc" },
    { ...mockRevisionWithActor, id: "456def" },
    { ...mockRevisionWithActor, id: "789ghi" },
  ],
  nextReview: mockWorkflow,
  previousReview: mockWorkflow,
  workflowId: "123abc",
  form: mockForm,
  nextSteps: [
    { ...mockNextStep, id: "123abc" },
    { ...mockNextStep, id: "456def" },
  ],
  comments: [mockComment],
}

export const mockSubmittedWorkflowWithExtras: MockWorkflowWithExtras = {
  ...mockWorkflowWithExtras,
  managerApprovedAt: null,
  managerApprovedBy: null,
  managerApprover: null,
  panelApprover: null,
  panelApprovedAt: null,
  panelApprovedBy: null,
}

export const mockManagerApprovedWorkflowWithExtras: MockWorkflowWithExtras = {
  ...mockWorkflowWithExtras,
  managerApprovedAt: new Date(),
  managerApprovedBy: mockUser.email,
  managerApprover: mockUser,
  panelApprover: null,
  panelApprovedAt: null,
  panelApprovedBy: null,
}

export const mockAuthorisedWorkflowWithExtras: MockWorkflowWithExtras = {
  ...mockWorkflowWithExtras,
  managerApprovedAt: new Date(),
  managerApprovedBy: mockUser.email,
  managerApprover: mockUser,
  panelApprover: mockUser,
  panelApprovedAt: new Date(),
  panelApprovedBy: mockUser.email,
}

export const mockAuthorisedWorkflow: Workflow = {
  ...mockWorkflow,
  managerApprovedAt: new Date(),
  managerApprovedBy: mockUser.email,
  panelApprovedAt: new Date(),
  panelApprovedBy: mockUser.email,
}
