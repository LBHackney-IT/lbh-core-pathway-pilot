import { DateTime } from "luxon"
import { RevisionWithActor } from "../types"

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
