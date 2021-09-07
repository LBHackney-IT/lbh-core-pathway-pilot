import { Team } from "@prisma/client"

/** convert enum values to pretty strings for display */
export const prettyTeamNames = {
  [Team.Access]: "Access team",
  [Team.CareManagement]: "Care management team",
  [Team.Review]: "Review team",
}
