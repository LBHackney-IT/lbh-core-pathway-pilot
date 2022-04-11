import { DateTime } from "luxon"
import nextStepOptions from "../config/nextSteps/nextStepOptions.json"
import { Form, Resident, RevisionWithActor } from "../types"
import ethnicities from "../config/ethnicities"
import { GmailMessage } from "../pages/api/gmail-add-on"
import { Workflow } from "@prisma/client"

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

/** Finds a human-readable form name from a list of workflows */
export const prettyFormName = (forms: Form[], w: Workflow): string =>
  forms?.find(form => form.id === w.formId)?.name || w.formId

/** a sentence summarising next steps that will be triggered */
export const prettyNextSteps = (
  nextSteps: { nextStepOptionId: string }[]
): string => {
  const all = nextSteps.map(nextStep =>
    nextStepOptions.find(o => o.id === nextStep.nextStepOptionId)
  )
  const now = all.filter(o => o?.waitForApproval).length
  const later = all.length - now

  if (now || later)
    return `${now || "No"} ${
      now === 1 ? "next step" : "next steps"
    } will be triggered now${
      later ? ` and ${later} during or after approval` : ""
    }.`

  return null
}

export const userInitials = (name: string): string => {
  const names = name.split(" ")
  return names
    .map(name => name[0])
    .join("")
    .toUpperCase()
}

/** Returns the description of an ethnicity from a code */
export const displayEthnicity = (code: string): string =>
  ethnicities.find(ethnicity => ethnicity.code === code)?.description ||
  ethnicities.find(ethnicity => ethnicity.description === code)?.description ||
  null

export const prettyGmailMessage = (message: GmailMessage): string => {
  return `
  FROM: ${message.from}
  TO: ${message.to}
  SUBJECT: ${message.subject}
  DATE: ${prettyDate(message.date)}
  ---
  ${message.body}
  ---
  `.trim()
}
