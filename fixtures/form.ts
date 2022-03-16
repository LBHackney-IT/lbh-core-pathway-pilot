import { Form } from "../types"

export const mockForm: Form = {
  id: "mock-form",
  name: "Mock form",
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
      typeFilter: ["Assessment"],
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
      typeFilter: ["Assessment", "Review Read-only"],
    },
    {
      id: "mock-theme-3",
      name: "Mock theme 3",
      steps: [
        {
          id: "mock-step-4",
          name: "Mock step 4",
          fields: [
            {
              id: "mock-question-4",
              question: "Mock question 4?",
              type: "text",
            },
          ],
        },
        {
          id: "mock-step-5",
          name: "Mock step 5",
          fields: [
            {
              id: "mock-question-5",
              question: "Mock question 5?",
              type: "text",
            },
          ],
        },
      ],
    },
  ],
}

export const mockForms: Form[] = [
  mockForm,
  { ...mockForm, id: "mock-form-2", name: "Mock form 2" },
  { ...mockForm, id: "mock-form-3", name: "Mock form 3" },
]
