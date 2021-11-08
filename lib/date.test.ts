import { isISODate } from "./date"

describe("isISODate", () => {
  ;["string", "some string"].forEach(date => {
    it(`returns false if it isn't an ISO date e.g ${date}`, () => {
      expect(isISODate(date)).toBe(false)
    })
  })

  ;["2021-11-09", "2021-11-09T15:30", "2021-11-09T15:30:15"].forEach(date => {
    it(`returns true if it is an ISO date e.g ${date}`, () => {
      expect(isISODate(date)).toBe(true)
    })
  })
})
