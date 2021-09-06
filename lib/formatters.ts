import { DateTime } from "luxon"
import nextStepOptions from "../config/nextSteps/nextStepOptions"
import { Resident, RevisionWithActor } from "../types"

/** Convert an ISO-formatted string into a human-friendly date string */
export const prettyDate = (isoDateString: string): string => {
  const parsed = DateTime.fromISO(isoDateString)
  return parsed.isValid ? parsed.toFormat("d MMM yyyy") : ""
}

/** Convert an ISO-formatted string into a human-friendly date string */
export const prettyDateToNow = (isoDateString: string): string => {
  const parsed = DateTime.fromISO(isoDateString)
  return parsed.isValid ? parsed.toRelative() : ""
}

/** Convert an ISO-formatted string into a human-friendly date string */
export const prettyDateAndTime = (isoDateString: string): string => {
  const parsed = DateTime.fromISO(isoDateString)
  return parsed.isValid ? parsed.toFormat("d MMM yyyy h.mm a") : ""
}

/** take a list of revisions and spit out a pretty string of the editors' names */
export const displayEditorNames = (
  revisions: RevisionWithActor[]
): string | false => {
  const names = revisions.reduce((acc, revision) => {
    if (!acc.includes(revision.actor.name)) acc.push(revision.actor.name)
    return acc
  }, [])

  if (names.length === 1) return names[0]
  if (names.length === 2) return `${names[0]} and ${names[1]}`
  if (names.length === 3) return `${names[0]}, ${names[1]} and 1 other`
  if (names.length > 3)
    return `${names[0]}, ${names[1]} and ${names.length - 2} others`
  return false
}

/** prettified full name for a resident */
export const prettyResidentName = (resident: Resident): string =>
  `${resident?.firstName?.trim() || ""} ${
    resident?.lastName?.trim() || ""
  }`.trim()

/** Shorten a long string to a given number of words for displaying in previews */
export const truncate = (str: string, noWords: number): string => {
  if (str.split(" ").length > noWords) {
    return str.split(" ").splice(0, noWords).join(" ") + "..."
  } else {
    return str
  }
}

/** a sentence summarising next steps that will be triggered */
export const prettyNextSteps = (
  nextSteps: { nextStepOptionId: string }[]
): string => {
  const now = 6
  let later

  if (now || later)
    return `Will trigger ${now || "no"} next steps now and ${
      later || "none"
    } upon manager approval.`

  return null
}
