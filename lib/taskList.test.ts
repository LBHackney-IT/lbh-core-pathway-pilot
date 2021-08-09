import { mockWorkflow } from "../fixtures/workflows"
import { baseAssessment, wrapUp } from "../config/forms"

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
      "Contingency plan": {},
      "Hearing Impairment": {},
      Eyesight: {},
    })
    expect(result).toStrictEqual({
      "Contingency plan": {
        "Contingency plan": {},
      },
      "Sensory Assessment": {
        "Hearing Impairment": {},
        Eyesight: {},
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

describe("buildThemes", () => {
  it("correctly builds a basic assessment", () => {
    const result = buildThemes(mockWorkflow)
    expect(result.length).toBe(6)
    expect(result[0]).toBe(baseAssessment.themes[0])

    expect(result[result.length - 1]).toBe(
      wrapUp.themes[wrapUp.themes.length - 1]
    )
  })

  it("correctly builds an assessment with elements", () => {
    const result = buildThemes({
      ...mockWorkflow,
      assessmentElements: ["Carer's assessment"],
    })
    expect(result.length).toBe(7)
    expect(result[0]).toBe(baseAssessment.themes[0])
    expect(result.find(theme => theme.name === "Contingency plan")).toBeTruthy()
    expect(result[result.length - 1]).toBe(
      wrapUp.themes[wrapUp.themes.length - 1]
    )
  })
})

describe("totalStepsFromThemes", () => {
  it("correctly gives the total number of steps for a basic assessment", () => {
    const result = totalStepsFromThemes(buildThemes(mockWorkflow))
    expect(result).toBe(19)
  })

  it("correctly gives the total number of steps for an assessment with elements", () => {
    const result = totalStepsFromThemes(
      buildThemes({
        ...mockWorkflow,
        assessmentElements: ["Carer's assessment"],
      })
    )
    expect(result).toBe(20)
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
    expect(result).toBeLessThanOrEqual(0.5)
  })

  it("can compare revisions", () => {
    const result = completeness(mockWorkflow, {
      ...mockRevision,
      answers: {
        foo: {},
      },
    })
    expect(result).toBeLessThanOrEqual(0.5)
  })
})
