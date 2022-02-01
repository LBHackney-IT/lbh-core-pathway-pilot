import { Team } from "@prisma/client"

/** convert enum values to pretty strings for display */
export const prettyTeamNames = {
  [Team.Access]: "Access",
  [Team.CareManagement]: "Case management",
  [Team.Review]: "Review",
  // finance teams
  [Team.DirectPayments]: "Direct payments",
  [Team.Brokerage]: "Brokerage",
  // second phase teams
  [Team.OccupationalTherapy]: "Occupational therapy",
  [Team.Sensory]: "Sensory",
  // third phase teams
  [Team.IntegratedLearningDisabilityService]: "Integrated Learning Disability Service",
  [Team.BenefitsAndHousingNeeds]: "Benefits and Housing Needs",
  [Team.Safeguarding]: "Safeguarding",
  [Team.IntegratedDischargeService]: "Integrated Discharge Service",
  [Team.MentalHealthCareForOlderPeople]: "Mental Health Care for Older People"
}
