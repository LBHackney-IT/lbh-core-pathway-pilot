import { User, Workflow } from "@prisma/client"
import { Form, RevisionWithActor } from "../types"
import { mockForm } from "./form"
import { mockRevisionWithActor } from "./revisions"
import { mockUser } from "./users"

export const mockWorkflow: Workflow = {
  id: "123abc",
  type: "Assessment",
  formId: "care-act-assessment",
  createdAt: new Date(
    "October 13, 2020 14:00:00"
  ).toISOString() as unknown as Date,
  createdBy: "foo.bar@hackney.gov.uk",
  assignedTo: "foo.bar@hackney.gov.uk",
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
}

interface WorkflowWithExtras extends Workflow {
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
}

export const mockWorkflowWithExtras: WorkflowWithExtras = {
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
    mockRevisionWithActor,
    mockRevisionWithActor,
    mockRevisionWithActor,
  ],
  nextReview: mockWorkflow,
  previousReview: mockWorkflow,
  workflowId: "123abc",
  form: mockForm,
}
