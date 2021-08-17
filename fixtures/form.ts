import { Team } from "@prisma/client"
import { Form } from "../types"

export const mockForm: Form = {
  id: "mock-form",
  name: "Mock form",
  teams: [Team.InformationAssessment],
  themes: [
    {
      id: "mock-theme",
      name: "Mock theme",
      steps: [
        {
          id: "Mock step",
          name: "Mock step",
          fields: [
            {
              id: "Mock question",
              question: "Mock question?",
              type: "text",
            },
          ],
        },
      ],
    },
    {
      id: "mock-theme-2",
      name: "Mock theme 2",
      steps: [
        {
          id: "Mock step 2",
          name: "Mock step 2",
          fields: [
            {
              id: "Mock question 2",
              question: "Mock question 2?",
              type: "text",
            },
          ],
        },
      ],
    },
  ],
}
