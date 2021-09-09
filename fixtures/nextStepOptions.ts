import { NextStepOption } from "../types"

export const mockNextStepOptions: NextStepOption[] = [
  {
    id: "foo",
    title: "Example next step",
    description: "Next step description goes here",
    email: "example@email.com",
    formIds: ["mock-form"],
    workflowToStart: "mock-form",
    createForDifferentPerson: true,
    handoverNote: true,
    waitForApproval: true,
  },
  {
    id: "bar",
    title: "Example next step 2",
    description: "Next step description 2 goes here",
    email: "example@email.com",
    formIds: ["mock-form"],
    workflowToStart: null,
    createForDifferentPerson: false,
    handoverNote: false,
    waitForApproval: false,
  },
]
