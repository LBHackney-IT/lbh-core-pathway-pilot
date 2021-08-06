import { mockWorkflow } from "../fixtures/workflows"
import { assessmentElements, baseAssessment, wrapUp } from "../config/forms"

import {
  buildThemes,
  completeness,
  groupAnswersByTheme,
  totalStepsFromThemes,
} from "./taskList"
import { mockRevision } from "../fixtures/revisions"

describe("groupAnswersByTheme", () => {
  it("correctly groups a valid set of answers", () => {
    const result = groupAnswersByTheme({
      "first-step": {},
      communication: {},
      "next-actions": {},
    })
    expect(result).toStrictEqual({
      "first-theme": {
        "first-step": {},
        communication: {},
      },
      "next-steps": {
        "next-actions": {},
      },
    })
  })

  it("gracefully handles steps without a matching theme", () => {
    const result = groupAnswersByTheme({
      communication: {},
      "step without a matching theme": {},
    })
    expect(result).toStrictEqual({
      "first-theme": {
        communication: {},
      },
    })
  })
})

describe("buildThemes", () => {
  it("correctly builds a basic assessment", () => {
    const result = buildThemes(mockWorkflow)
    expect(result.length).toBe(2)
    expect(result[0]).toBe(baseAssessment.themes[0])
    expect(result[1]).toBe(wrapUp.themes[0])
  })

  it("correctly builds an assessment with elements", () => {
    const result = buildThemes({
      ...mockWorkflow,
      assessmentElements: ["sandbox-form"],
    })
    expect(result.length).toBe(3)
    expect(result[0]).toBe(baseAssessment.themes[0])
    expect(result[1]).toBe(assessmentElements[0].themes[0])
    expect(result[2]).toBe(wrapUp.themes[0])
  })
})

describe("totalStepsFromThemes", () => {
  it("correctly gives the total number of steps for a basic assessment", () => {
    const result = totalStepsFromThemes(buildThemes(mockWorkflow))
    expect(result).toBe(20)
  })

  it("correctly gives the total number of steps for an assessment with elements", () => {
    const result = totalStepsFromThemes(
      buildThemes({
        ...mockWorkflow,
        assessmentElements: ["sandbox-form"],
      })
    )
    expect(result).toBe(21)
  })

  it("fails gracefully", () => {
    const result = totalStepsFromThemes([])
    expect(result).toBeFalsy()
  })
})

describe("completeness", () => {
  it("gives 0 for a brand new workflow", () => {
    const result = completeness(mockWorkflow)
    expect(result).toBe(0)
  })

  it("gives the correct value for an in progress workflow", () => {
    const result = completeness({
      ...mockWorkflow,
      answers: {
        foo: {},
        bar: {},
      },
    })
    expect(result).toBe(0.1)
  })

  it("can compare revisions", () => {
    const result = completeness(mockWorkflow, {
      ...mockRevision,
      answers: {
        foo: {},
      },
    })
    expect(result).toBe(0.05)
  })
})
