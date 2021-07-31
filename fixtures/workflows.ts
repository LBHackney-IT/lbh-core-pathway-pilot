import { Workflow, AssessmentType } from "@prisma/client"

export const mockWorkflow: Workflow = {
  id: "123abc",
  type: AssessmentType.full,
  createdAt: new Date(),
  createdBy: "foo.bar@hackney.gov.uk",
  updatedAt: new Date(),
  answers: {},
  socialCareId: "123",
  reviewOf: null,
  submittedAt: null,
  submittedBy: null,
  managerApprovedAt: null,
  managerApprovedBy: null,
  panelApprovedAt: null,
  panelApprovedBy: null,
}
