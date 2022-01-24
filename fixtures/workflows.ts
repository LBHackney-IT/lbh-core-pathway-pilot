import {
  Team,
  User,
  Workflow,
  NextStep,
  Comment,
  WorkflowType,
} from "@prisma/client"
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
  acknowledgedAt: null,
  acknowledgedBy: null,
  acknowledgingTeam: null,
  panelApprovedAt: null,
  panelApprovedBy: null,
  discardedAt: null,
  discardedBy: null,
  heldAt: null,
  needsPanelApproval: true,
  linkToOriginal: null,
  episodeId: null,
}

export interface MockWorkflowWithExtras extends Workflow {
  creator: User
  assignee: User
  updater: User
  submitter: User
  managerApprover: User
  panelApprover: User
  discarder: User
  acknowledger: User
  nextWorkflows: Workflow[]
  previousWorkflow: Workflow
  form: Form
  revisions: RevisionWithActor[]
  nextSteps: NextStep[]
  comments: Comment[]
}

export const mockWorkflowWithExtras: MockWorkflowWithExtras = {
  ...mockWorkflow,
  type: WorkflowType.Reassessment,
  creator: mockUser,
  assignedTo: "firstname.surname@hackney.gov.uk",
  assignee: mockUser,
  updatedBy: "firstname.surname@hackney.gov.uk",
  updater: mockUser,
  submitter: mockUser,
  discarder: mockUser,
  managerApprover: mockUser,
  panelApprover: mockUser,
  acknowledger: mockUser,
  revisions: [
    { ...mockRevisionWithActor, id: "123abc" },
    { ...mockRevisionWithActor, id: "456def" },
    { ...mockRevisionWithActor, id: "789ghi" },
  ],
  nextWorkflows: [mockWorkflow],
  previousWorkflow: mockWorkflow,
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
  submittedAt: new Date(),
  submittedBy: mockUser.email,
  managerApprovedAt: null,
  managerApprovedBy: null,
  managerApprover: null,
  panelApprover: null,
  panelApprovedAt: null,
  panelApprovedBy: null,
  workflowId: null,
}

export const mockManagerApprovedWorkflowWithExtras: MockWorkflowWithExtras = {
  ...mockWorkflowWithExtras,
  submittedAt: new Date(),
  submittedBy: mockUser.email,
  managerApprovedAt: new Date(),
  managerApprovedBy: mockUser.email,
  managerApprover: mockUser,
  panelApprover: null,
  panelApprovedAt: null,
  panelApprovedBy: null,
  workflowId: null,
}

export const mockAuthorisedWorkflowWithExtras: MockWorkflowWithExtras = {
  ...mockWorkflowWithExtras,
  submittedAt: new Date(),
  submittedBy: mockUser.email,
  managerApprovedAt: new Date(),
  managerApprovedBy: mockUser.email,
  managerApprover: mockUser,
  panelApprover: mockUser,
  panelApprovedAt: new Date(),
  panelApprovedBy: mockUser.email,
  workflowId: null,
}

export const mockAuthorisedWorkflow: Workflow = {
  ...mockWorkflow,
  submittedAt: new Date(),
  submittedBy: mockUser.email,
  managerApprovedAt: new Date(),
  managerApprovedBy: mockUser.email,
  panelApprovedAt: new Date(),
  panelApprovedBy: mockUser.email,
  workflowId: null,
}
