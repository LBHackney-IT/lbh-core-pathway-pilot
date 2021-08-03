import { isTimetableAnswer } from "./TimetableAnswer"

describe("isTimetableAnswer", () => {
  it("correctly identifies timetable-shaped answers", () => {
    const result = isTimetableAnswer({
      Mon: {},
      Tue: {},
      Wed: {},
      Thu: {},
      Fri: {},
      Sat: {},
      Sun: {},
      "Any day": {},
    })
    expect(result).toBeTruthy()

    const result2 = isTimetableAnswer({
      foo: {},
    })
    expect(result2).toBeFalsy()
  })
})
