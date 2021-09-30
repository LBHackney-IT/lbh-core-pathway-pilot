import { Comment } from ".prisma/client"

export const mockComment: Comment = {
  id: "123",
  text: "example comment text",
  action: "Edited",
  createdAt: new Date("October 13, 2020 14:00:00"),
  createdBy: "example@email.com",
  workflowId: "123abc",
}
