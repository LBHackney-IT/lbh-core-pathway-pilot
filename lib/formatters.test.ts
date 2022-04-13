import { mockRevisionWithActor } from "../fixtures/revisions"
import localNextStepOptions from "../config/nextSteps/nextStepOptions.json"

import {
  displayEditorNames,
  displayEthnicity,
  emailInitials,
  prettyDate,
  prettyDateAndTime,
  prettyDateToNow,
  prettyGmailMessage,
  prettyNextSteps,
  prettyResidentName,
  truncate,
  userInitials,
} from "./formatters"

jest
  .spyOn(global.Date, "now")
  .mockImplementation(() => new Date("2020-12-14T11:01:58.135Z").valueOf())

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

describe("prettyDateToNow", () => {
  it("correctly formats ISO date strings", () => {
    const result = prettyDateToNow("1990-04-10T00:00:00.0000000")
    expect(result).toEqual("30 years ago")

    const result2 = prettyDateToNow("2021-10-08T12:55:00.0000000")
    expect(result2).toEqual("in 9 months")
  })

  it("prints nothing if fed an unparsable string", () => {
    const result = prettyDateToNow("blah")
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

describe("prettyResidentName", () => {
  it("trims trailing and leading whitespace", () => {
    const result = prettyResidentName({
      firstName: "   First   ",
      lastName: "   Last     ",
    })
    expect(result).toBe("First Last")
  })

  it("deals with incomplete data", () => {
    const result = prettyResidentName({
      firstName: "   First   ",
    })
    expect(result).toBe("First")
  })
})

describe("truncate", () => {
  it("leaves short text unaltered", () => {
    expect(truncate("Example input", 2)).toBe("Example input")
  })
  it("truncates longer text", () => {
    expect(truncate("Example input example input", 2)).toBe("Example input...")
  })
})

describe("prettyNextSteps", () => {
  it("returns null if no next steps are passed to it", () => {
    const expectedResult = prettyNextSteps([])

    expect(expectedResult).toBeNull()
  })

  it("returns a string describing a single step being triggered now", async () => {
    const stepWaitingForApproval = localNextStepOptions
      .filter(o => o?.waitForApproval)
      .slice(0, 1)

    const nextStepIds = [{ nextStepOptionId: stepWaitingForApproval[0].id }]

    const expectedResult = prettyNextSteps(nextStepIds)

    expect(expectedResult).toBe("1 next step will be triggered now.")
  })

  it("returns a string describing a single step being triggered in the future", async () => {
    const stepNotWaitingForApproval = localNextStepOptions
      .filter(o => o?.waitForApproval == false)
      .slice(0, 1)

    const nextStepIds = [{ nextStepOptionId: stepNotWaitingForApproval[0].id }]

    const expectedResult = prettyNextSteps(nextStepIds)

    expect(expectedResult).toBe(
      "No next steps will be triggered now and 1 during or after approval."
    )
  })

  it("returns a string describing how many steps will be triggered now and how many in the future", async () => {
    const stepWaitingForApproval = localNextStepOptions
      .filter(o => o?.waitForApproval)
      .slice(0, 1)

    const stepNotWaitingForApproval = localNextStepOptions
      .filter(o => o?.waitForApproval == false)
      .slice(0, 1)

    const nextStepIds = [
      { nextStepOptionId: stepWaitingForApproval[0].id },
      { nextStepOptionId: stepNotWaitingForApproval[0].id },
    ]

    const expectedResult = prettyNextSteps(nextStepIds)

    expect(expectedResult).toBe(
      "1 next step will be triggered now and 1 during or after approval."
    )
  })
})

describe("displayEthnicity", () => {
  it("retuns the description of the ethnicity code", () => {
    expect(displayEthnicity("A.A1")).toBe("British")
  })

  it("retuns the description of the ethnicity", () => {
    expect(displayEthnicity("British")).toBe("British")
  })

  it("retuns null if ethnicity code is unknown", () => {
    expect(displayEthnicity("UNKNOWN")).toBeNull()
  })
})

describe("userInitials", () => {
  it("properly splits a name String into initials", () => {
    const actual = userInitials("Phoenix Ryder ")
    const expected = "PR"
    expect(actual).toBe(expected)
  })
  it("returns single initial if single name is passed", () => {
    expect(userInitials("Phoenix")).toBe("P")
  })

  it("returns null when falsey name supplied", () => {
    expect(userInitials("")).toBeNull()
    expect(userInitials(null)).toBeNull()
  })
})

describe("prettyGmailMessage", () => {
  it("correctly formats a message", () => {
    const result = prettyGmailMessage({
      body: "eyup",
      to: "to@to.com",
      from: "from@from.com",
      date: "2021-12-01T14:14:30.000Z",
      subject: "subject line",
    })

    expect(result).toBe(`FROM: from@from.com
  TO: to@to.com
  SUBJECT: subject line
  DATE: 1 Dec 2021
  ---
  eyup
  ---`)
  })
})

describe("emailInitials", () => {
  it("ascertains initials from email address", () => {
    expect(emailInitials("Phoenix.Ryder@hackney.gov.uk")).toBe("PR")
  })

  it("ascertains single initial from email address", () => {
    expect(emailInitials("Phoenix@hackney.gov.uk")).toBe("P")
  })

  it("returns empty string when falsey email supplied", () => {
    expect(emailInitials("")).toBe("??")
    expect(emailInitials(null)).toBe("??")
  })
})
