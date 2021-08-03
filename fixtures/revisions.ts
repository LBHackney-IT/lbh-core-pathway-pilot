import { Revision } from "@prisma/client"
import { RevisionWithActor } from "../types"
import { mockUser } from "./users"

export const mockRevision: Revision = {
  id: "123abc",
  action: "Edited",
  answers: {},
  createdAt: new Date("October 13, 2020 14:00:00"),
  createdBy: "foo.bar@hackney.gov.uk",
  workflowId: "abc123",
}

export const mockRevisionWithActor: RevisionWithActor = {
  ...mockRevision,
  actor: mockUser,
}
