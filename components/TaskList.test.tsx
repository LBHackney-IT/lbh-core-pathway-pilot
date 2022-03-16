import { act, render, screen } from "@testing-library/react"
import { mockForm } from "../fixtures/form"
import { mockWorkflowWithExtras } from "../fixtures/workflows"
import TaskList from "./TaskList"

const switchEnv = environment => {
  const oldEnv = process.env.NODE_ENV
  process.env.NEXT_PUBLIC_ENV = environment
  // @ts-ignore
  process.env.NODE_ENV = environment

  return () => switchEnv(oldEnv)
}

const extraFieldsForm = {
  ...mockForm,
  themes: [
    ...mockForm.themes,
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

    {
      id: "mock-theme-4",
      name: "Mock theme 4",
      steps: [
        {
          id: "mock-step-6",
          name: "Mock step 6",
          fields: [
            {
              id: "mock-question-6",
              question: "Mock question 6?",
              type: "text",
            },
          ],
        },
      ],
      typeFilter: ["Assessment"],
    },
  ],
}

const mockWorkflowWithUpdatedForm = {
  ...mockWorkflowWithExtras,
  form: extraFieldsForm,
}

describe("Task List Component Tests in development", () => {
  let switchBack

  beforeAll(() => (switchBack = switchEnv("development")))
  beforeEach(async () => {
    await act(async () => {
      await render(<TaskList workflow={mockWorkflowWithUpdatedForm} />)
    })
  })
  afterAll(() => switchBack())

  it("should show a theme if typeFilter matches the workflow type", () => {
    expect(screen.getAllByText("3. Mock theme 4")).not.toBe(null)
  })
  it("should not show a theme if there is no typeFilter", () => {
    expect(screen.queryByText("3. Mock theme 3")).toBe(null)
  })
  it("should show a theme if there are multiple typeFilter and one of them matches the workflow type", () => {
    expect(screen.queryByText("2. Mock theme 2")).not.toBe(null)
  })
})

describe("Task List Component Tests in test", () => {
  let switchBack

  beforeAll(() => (switchBack = switchEnv("test")))
  beforeEach(async () => {
    await act(async () => {
      await render(<TaskList workflow={mockWorkflowWithUpdatedForm} />)
    })
  })
  afterAll(() => switchBack())

  it("should show a theme if the typeFilter matches the workflow type", () => {
    expect(screen.getAllByText("3. Mock theme 4")).not.toBe(null)
  })
  it("should not show a theme if there is no typeFilter", () => {
    expect(screen.queryByText("3. Mock theme 3")).toBe(null)
  })
})

describe("Task List Component Tests in production", () => {
  let switchBack

  beforeAll(() => (switchBack = switchEnv("production")))
  beforeEach(async () => {
    await act(async () => {
      await render(<TaskList workflow={mockWorkflowWithUpdatedForm} />)
    })
  })
  afterAll(() => switchBack())

  it("should show a theme if the typeFilter matches the workflow type", () => {
    expect(screen.getAllByText("4. Mock theme 4")).not.toBe(null)
  })
  it("should show a theme if there is no typeFilter", () => {
    expect(screen.queryByText("3. Mock theme 3")).not.toBe(null)
  })
})
