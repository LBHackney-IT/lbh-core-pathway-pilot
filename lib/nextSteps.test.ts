import { mockWorkflowWithExtras } from "../fixtures/workflows"
import { triggerNextSteps } from "./nextSteps"
import prisma from "./prisma"
import { notifyNextStep } from "./notify"

jest.mock("./prisma", () => ({
  workflow: {
    create: jest.fn(),
    update: jest.fn(),
  },
}))

jest.mock("./notify")

beforeEach(() => {
  ;(prisma.workflow.create as jest.Mock).mockClear()
  ;(prisma.workflow.update as jest.Mock).mockClear()
})

describe("nextSteps", () => {
  it("does nothing if all steps are already triggered", async () => {
    await triggerNextSteps(mockWorkflowWithExtras)
    expect(prisma.workflow.create).toBeCalledTimes(0)
    expect(prisma.workflow.update).toBeCalledTimes(0)
    expect(notifyNextStep).toBeCalledTimes(0)
  })

  //   it("can fire off an immediate step, without an email", async () => {
  //   })

  //   it("can fire off a step that needs approval, with an email", async () => {
  //   })
})
