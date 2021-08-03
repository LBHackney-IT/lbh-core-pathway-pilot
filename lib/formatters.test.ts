import { mockRevisionWithActor } from "../fixtures/revisions"
import { displayEditorNames, prettyDate, prettyDateAndTime } from "./formatters"

describe("prettyDate", () => {
  it("correctly formats ISO date strings", () => {
    const result = prettyDate("1990-04-10T00:00:00.0000000")
    expect(result).toEqual("10 Apr 1990")

    const result2 = prettyDate("2021-12-08T12:55:00.0000000")
    expect(result2).toEqual("8 Dec 2021")
  })

  it("prints nothing if fed an unparsable string", () => {
    const result = prettyDate("blah")
    expect(result).toBe("")
  })
})

describe("prettyDateAndTime", () => {
  it("correctly formats ISO timedate strings", () => {
    const result = prettyDateAndTime("1990-04-10T00:00:00.0000000")
    expect(result).toEqual("10 Apr 1990 12.00 AM")

    const result2 = prettyDateAndTime("2021-12-08T13:55:00.0000000")
    expect(result2).toEqual("8 Dec 2021 1.55 PM")
  })

  it("prints nothing if fed an unparsable string", () => {
    const result = prettyDateAndTime("blah")
    expect(result).toBe("")
  })
})

describe("displayEditorNames", () => {
  it("returns false when there are no editors", () => {
    const result = displayEditorNames([])
    expect(result).toBeFalsy()
  })

  it("correctly formats a single editor", () => {
    const result = displayEditorNames([mockRevisionWithActor])
    expect(result).toBe("Firstname Surname")
  })

  it("correctly formats deduplicates multiple revisions by the same editor", () => {
    const result = displayEditorNames([
      mockRevisionWithActor,
      mockRevisionWithActor,
    ])
    expect(result).toBe("Firstname Surname")
  })
})
