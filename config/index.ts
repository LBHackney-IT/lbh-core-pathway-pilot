import { DateTime } from "luxon"

// save revisions at most every ten seconds
export const revisionInterval = 10000

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
