import TimetableAnswer, { isTimetableAnswer } from "./TimetableAnswer"
import { render, screen, within } from "@testing-library/react"

describe("isTimetableAnswer", () => {
  it("returns true if values are at root-level", () => {
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

  it("returns true if values are in a timetable property", () => {
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

describe("TimetableAnswer", () => {
  it("displays the timetable if values are at root-level", () => {
    const answers = {
      Mon: { Morning: "15", Afternoon: "30" },
      Tue: {},
      Wed: {},
      Thu: {},
      Fri: { Evening: "60", Night: "75" },
      Sat: {},
      Sun: {},
      "Any day": {},
    }

    render(<TimetableAnswer answers={answers} />)

    const mondayRow = screen.getByText("Mon").closest("tr")

    expect(within(mondayRow).getByText(15)).toBeVisible()
    expect(within(mondayRow).getByText(30)).toBeVisible()

    const fridayRow = screen.getByText("Fri").closest("tr")

    expect(within(fridayRow).getByText(60)).toBeVisible()
    expect(within(fridayRow).getByText(75)).toBeVisible()
  })

  it("displays the timetable if values are in a timetable property", () => {
    const answers = {
      timetable: {
        Mon: { Morning: "15", Afternoon: "30" },
        Tue: {},
        Wed: {},
        Thu: {},
        Fri: { Evening: "60", Night: "75" },
        Sat: {},
        Sun: {},
        "Any day": {},
      },
    }

    render(<TimetableAnswer answers={answers} />)

    const mondayRow = screen.getByText("Mon").closest("tr")

    expect(within(mondayRow).getByText(15)).toBeVisible()
    expect(within(mondayRow).getByText(30)).toBeVisible()

    const fridayRow = screen.getByText("Fri").closest("tr")

    expect(within(fridayRow).getByText(60)).toBeVisible()
    expect(within(fridayRow).getByText(75)).toBeVisible()
  })

  it("displays the summary if values are in a timetable property", () => {
    const answers = {
      timetable: {
        Mon: { Morning: "15", Afternoon: "30" },
        Tue: {},
        Wed: {},
        Thu: {},
        Fri: { Evening: "60", Night: "75" },
        Sat: {},
        Sun: {},
        "Any day": {},
      },
      summary: {
        "annual cost": "£2808",
        "total hours": "3",
        "weekly cost": "£54",
      },
    }

    render(<TimetableAnswer answers={answers} />)

    expect(screen.getByText("3 hours total")).toBeVisible()
    expect(
      screen.getByText("£2808 estimated annual cost (or £54 weekly, at £18/hour)")
    ).toBeVisible()
  })
})
