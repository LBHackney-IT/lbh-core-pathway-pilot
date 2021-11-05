import { Team } from "@prisma/client"

/** convert enum values to pretty strings for display */
export const prettyTeamNames = {
  [Team.Access]: "Access",
  [Team.CareManagement]: "Case management",
  [Team.Review]: "Review",
  // finance teams
  [Team.DirectPayments]: "Direct payments",
  [Team.Brokerage]: "Brokerage",
}
