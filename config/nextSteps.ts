import { NextStep } from "../types"

const nextSteps: NextStep[] = [
  {
    id: "refer-1",
    title: "Refer to team 1",
    description:
      "Longer description of when this is suitable. It will send an email.",
    email: "email@example.com",
    workflowsToStart: [],
  },
  {
    id: "refer-2",
    title: "Refer to team 2",
    description:
      "Longer description of when this is suitable. It will send an email and make a workflow.",
    email: "email@example.com",
    workflowsToStart: ["mock-form"],
  },
]

export default nextSteps
