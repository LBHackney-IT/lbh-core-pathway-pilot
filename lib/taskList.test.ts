import { mockWorkflowWithExtras } from "../fixtures/workflows"
import {
  completeness,
  groupAnswersByTheme,
  totalStepsFromThemes,
} from "./taskList"
import { mockRevision } from "../fixtures/revisions"

describe("groupAnswersByTheme", () => {
  it("correctly groups a valid set of answers", () => {
    const result = groupAnswersByTheme({
      "mock-step": {},
      "mock-step-2": {},
      "mock-step-3": {},
    })
    expect(result).toStrictEqual({
      "mock-theme": {
        "mock-step": {},
      },
      "mock-theme-2": {
        "mock-step-2": {},
        "mock-step-3": {},
      },
    })
  })

  it("gracefully handles steps without a matching theme", () => {
    const result = groupAnswersByTheme({
      foo: {},
      bar: {},
    })
    expect(result).toStrictEqual({})
  })
})

describe("totalStepsFromThemes", () => {
  it("correctly gives the total number of steps", () => {
    const result = totalStepsFromThemes(mockWorkflowWithExtras.form.themes)
    expect(result).toBe(3)
  })

  it("fails gracefully", () => {
    const result = totalStepsFromThemes([])
    expect(result).toBeFalsy()
  })
})

describe("completeness", () => {
  it("gives 0 for a brand new workflow", () => {
    const result = completeness(mockWorkflowWithExtras)
    expect(result).toBe(0)
  })

  it("gives the correct value for an in progress workflow", () => {
    const result = completeness({
      ...mockWorkflowWithExtras,
      answers: {
        foo: {},
      },
    })
    expect(result).toBeLessThanOrEqual(0.5)
  })

  it("gives the correct value for a completed workflow", () => {
    const result = completeness({
      ...mockWorkflowWithExtras,
      answers: {
        foo: {},
        bar: {},
      },
    })
    expect(result).toBeLessThanOrEqual(1)
  })

  it("can compare revisions", () => {
    const result = completeness(mockWorkflowWithExtras, {
      ...mockRevision,
      answers: {
        foo: {},
      },
    })
    expect(result).toBeLessThanOrEqual(0.5)
  })
})
