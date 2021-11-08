import { DateTime } from "luxon"

export const isISODate = (string: string): boolean =>
  DateTime.fromISO(string).isValid
