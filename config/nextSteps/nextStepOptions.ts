import { NextStepOption } from "../../types"
import data from "./nextStepOptions.json"
import { mockNextStepOptions } from "../../fixtures/nextStepOptions"

const nextStepOptions: NextStepOption[] = data

/** if this is cypress, return a static mock form instead */
const nextStepOptionsForThisEnv: NextStepOption[] =
  process.env.NEXT_PUBLIC_ENV === "test" || process.env.NODE_ENV === "test"
    ? mockNextStepOptions
    : nextStepOptions

export default nextStepOptionsForThisEnv
