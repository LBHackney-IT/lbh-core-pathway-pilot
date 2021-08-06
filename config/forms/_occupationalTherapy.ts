import { FormElement } from "../../types"

const form: FormElement = {
  id: "sandbox-form",
  name: "Sandbox form",
  themes: [
    {
      id: "first-theme",
      name: "First theme",
      steps: [
        {
          id: "living-situation",
          name: "Living situation",
          fields: [
            {
              id: "one",
              type: "radios",
              question: "First question",
              required: true,
            },
            {
              id: "two",
              type: "radios",
              question: "Second question",
              required: true,
            },
            {
              id: "three",
              type: "radios",
              question: "Third question",
              required: true,
            },
          ],
        },
      ],
    },
  ],
}

export default form
