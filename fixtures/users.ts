import { Team, User } from "@prisma/client"

export const mockUser: User = {
  id: "123abc",
  name: "Firstname Surname",
  email: "firstname.surname@hackney.gov.uk",
  emailVerified: new Date("October 13, 2020 14:00:00"),
  createdAt: new Date("October 13, 2020 14:00:00"),
  image: null,
  updatedAt: new Date("October 13, 2020 14:00:00"),
  team: Team.Access,
  approver: false,
  panelApprover: false,
  shortcuts: ["foo", "bar"],
}

export const mockApprover = {
  ...mockUser,
  approver: true,
  panelApprover: false,
}

export const mockPanelApprover = {
  ...mockUser,
  approver: false,
  panelApprover: true,
}
