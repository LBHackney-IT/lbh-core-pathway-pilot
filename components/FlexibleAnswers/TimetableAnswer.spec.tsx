import { isTimetableAnswer } from "./TimetableAnswer"

describe("isTimetableAnswer", () => {
  it("returns true if properties at root-level", () => {
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
  })

  it("returns true if timetable and summary properties", () => {
    const result = isTimetableAnswer({
      timetable: {
        Mon: {},
        Tue: {},
        Wed: {},
        Thu: {},
        Fri: {},
        Sat: {},
        Sun: {},
        "Any day": {},
      },
    })

    expect(result).toBeTruthy()
  })

  it("returns false if timetable property isn't a timetable", () => {
    const result = isTimetableAnswer({
      timetable: { foo: {} },
    })

    expect(result).toBe(false)
  })

  it("returns false if not expected shaped", () => {
    const result = isTimetableAnswer({
      foo: {},
    })

    expect(result).toBe(false)
  })
})
