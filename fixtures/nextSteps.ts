import { NextStep } from ".prisma/client"

export const mockNextStep: NextStep = {
  id: "123abc",
  workflowId: "abc123",
  nextStepOptionId: "qwer1234",
  altSocialCareId: "123456",
  note: "Example note",
  createdAt: new Date("October 13, 2020 14:00:00"),
  updatedAt: new Date("October 13, 2020 14:00:00"),
  triggeredAt: new Date("October 13, 2020 14:00:00"),
}
