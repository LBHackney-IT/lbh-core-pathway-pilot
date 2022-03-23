import { Form } from "../types"

export const mockForm: Form = {
  id: "mock-form",
  name: "Mock form",
  approvable: true,
  themes: [
    {
      id: "mock-theme",
      name: "Mock theme",
      steps: [
        {
          id: "mock-step",
          name: "Mock step",
          fields: [
            {
              id: "mock-question",
              question: "Mock question?",
              type: "text",
            },
          ],
        },
      ],
      typeFilter: ["Assessment", "Reassessment", "Review"],
    },
    {
      id: "mock-theme-2",
      name: "Mock theme 2",
      steps: [
        {
          id: "mock-step-2",
          name: "Mock step 2",
          fields: [
            {
              id: "mock-question-2",
              question: "Mock question 2?",
              type: "text",
            },
          ],
        },
        {
          id: "mock-step-3",
          name: "Mock step 3",
          fields: [
            {
              id: "mock-question-3",
              question: "Mock question 3?",
              type: "text",
            },
          ],
        },
      ],
      typeFilter: ["Assessment", "Reassessment"],
    },
  ],
}

export const mockForms: Form[] = [
  mockForm,
  { ...mockForm, id: "mock-form-2", name: "Mock form 2" },
  { ...mockForm, id: "mock-form-3", name: "Mock form 3" },
]
