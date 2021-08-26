import { Team } from "@prisma/client"

/** convert enum values to pretty strings for display */
export const prettyTeamNames = {
  [Team.InformationAssessment]: "Information assessment",
  [Team.LongTermCare]: "Long term care",
}
