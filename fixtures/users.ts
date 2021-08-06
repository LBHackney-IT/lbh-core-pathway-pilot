import { User } from "@prisma/client"
import teams from "../config/teams"

export const mockUser: User = {
  id: "123abc",
  name: "Firstname Surname",
  email: "firstname.surname@hackney.gov.uk",
  emailVerified: new Date("October 13, 2020 14:00:00"),
  createdAt: new Date("October 13, 2020 14:00:00"),
  image: null,
  updatedAt: new Date("October 13, 2020 14:00:00"),
  team: teams[0],
  approver: false,
}
