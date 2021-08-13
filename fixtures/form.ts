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
  ],
}
