import { DateTime } from "luxon"

/** what notify replyto id should we use? */
export const emailReplyToId = "f2618d47-0f7f-4753-baee-fbd5a13061d8"

/** how often should revisions be saved, at most? */
export const revisionInterval = 120000

/** the hourly price of care, used for cost estimates */
export const costPerHour = 18

export const quickDateChoices = {
  "6 months from now": DateTime.local()
    .plus({
      months: 6,
    })
    .toISO(),
  "12 months from now": DateTime.local()
    .plus({
      months: 12,
    })
    .toISO(),
}

/** which form id represents a screening? */
export const screeningFormId = "initial-contact-assessment"

/** how many workflows per page of results on the dashboard? */
export const defaultPerPage = 20

export const unprotectedPages = ["/403", "/404", "/500"]
