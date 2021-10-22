import { DateTime } from "luxon"

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
export const screeningFormId = "screening-assessment"

/** how many workflows per page of results on the dashboard? */
export const perPage = 20

export const unprotectedPages = ["/sign-in", "/403", "/404", "/500"]
