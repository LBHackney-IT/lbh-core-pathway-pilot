import { DateTime } from "luxon"

/** Convert an ISO-formatted string into a human-friendly date string */
export const prettyDate = (isoDateString: string): string => {
  const parsed = DateTime.fromISO(isoDateString)
  return parsed.isValid ? parsed.toFormat("d MMM yyyy") : ""
}

/** Convert an ISO-formatted string into a human-friendly date string */
export const prettyDateAndTime = (isoDateString: string): string => {
  const parsed = DateTime.fromISO(isoDateString)
  return parsed.isValid ? parsed.toFormat("d MMM yyyy h.mm a") : ""
}
