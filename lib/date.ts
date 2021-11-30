import { DateTime } from "luxon"

export const isISODate = (string: string): boolean =>
  isNaN(Number(string)) && DateTime.fromISO(string).isValid
