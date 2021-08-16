import { mockWorkflowWithExtras } from "../fixtures/workflows"
import {
  completeness,
  groupAnswersByTheme,
  totalStepsFromThemes,
} from "./taskList"
import { mockRevision } from "../fixtures/revisions"

jest.mock(
  "../config/forms",
  () => [
    {
      themes: [
        {
          id: "Carer's assessment",
          steps: [
            {
              id: "Contingency plan",
            },
          ],
        },
        {
          id: "Sensory assessment",
          steps: [
            {
              id: "Hearing impairment",
            },
            {
              id: "Eyesight",
            },
          ],
        },
      ],
    },
  ],
  { virtual: true }
)

describe("groupAnswersByTheme", () => {
  it("correctly groups a valid set of answers", () => {
    const result = groupAnswersByTheme({
      "Contingency plan": {},
      "Hearing impairment": {},
      Eyesight: {},
    })
    expect(result).toStrictEqual({
      "Carer's assessment": {
        "Contingency plan": {},
      },
      "Sensory assessment": {
        "Hearing impairment": {},
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

describe("totalStepsFromThemes", () => {
  it("correctly gives the total number of steps", () => {
    const result = totalStepsFromThemes(mockWorkflowWithExtras.form.themes)
    expect(result).toBe(2)
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
