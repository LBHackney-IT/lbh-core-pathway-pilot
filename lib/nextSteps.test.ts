import { mockWorkflowWithExtras } from "../fixtures/workflows"
import { triggerNextSteps } from "./nextSteps"
import prisma from "./prisma"
import { notifyNextStep } from "./notify"
import { Team } from ".prisma/client"
import { mockNextStep } from "../fixtures/nextSteps"

console.error = jest.fn()

jest.spyOn(global, "Date").mockReturnValue("2000-01-01T00:00:00.000Z")

jest.mock("./prisma", () => ({
  workflow: {
    create: jest.fn(),
  },
  nextStep: {
    update: jest.fn(),
  },
}))

jest.mock("./notify")

beforeEach(() => {
  ;(prisma.workflow.create as jest.Mock).mockClear()
  ;(prisma.nextStep.update as jest.Mock).mockClear()
  ;(notifyNextStep as jest.Mock).mockClear()
})

describe("nextSteps", () => {
  it("does nothing but log an error if fed steps that have already been triggered", async () => {
    await triggerNextSteps(mockWorkflowWithExtras)
    expect(console.error).toBeCalledTimes(2)
    expect(prisma.workflow.create).toBeCalledTimes(0)
    expect(prisma.nextStep.update).toBeCalledTimes(0)
    expect(notifyNextStep).toBeCalledTimes(0)
  })

  it("marks a next step as triggered when it is run", async () => {
    await triggerNextSteps({
      ...mockWorkflowWithExtras,
      nextSteps: [
        {
          ...mockNextStep,
          nextStepOptionId: "email-only",
          triggeredAt: null,
        },
      ],
    })
    expect(prisma.nextStep.update).toBeCalledWith({
      data: { triggeredAt: new Date() },
      where: { id: mockWorkflowWithExtras.id },
    })
  })

  it("can fire off a step with an email", async () => {
    const data = {
      ...mockWorkflowWithExtras,
      nextSteps: [
        {
          ...mockNextStep,
          nextStepOptionId: "email-only",
          triggeredAt: null,
        },
      ],
    }
    await triggerNextSteps(data)
    expect(notifyNextStep).toBeCalledWith(
      data,
      "example@email.com",
      process.env.NEXTAUTH_URL
    )
  })

  it("can fire off a step with a new workflow", async () => {
    const data = {
      ...mockWorkflowWithExtras,
      managerApprovedAt: new Date(),
      nextSteps: [
        {
          ...mockNextStep,
          nextStepOptionId: "email-and-workflow-on-approval",
          triggeredAt: null,
        },
      ],
    }
    await triggerNextSteps(data)
    expect(prisma.workflow.create).toBeCalledWith({
      data: {
        assignedTo: "firstname.surname@hackney.gov.uk",
        createdBy: "firstname.surname@hackney.gov.uk",
        formId: "mock-form",
        socialCareId: "123456",
        teamAssignedTo: Team.Access,
      },
    })
  })

  it("waits for approval if needed", async () => {
    const data = {
      ...mockWorkflowWithExtras,
      nextSteps: [
        {
          ...mockNextStep,
          nextStepOptionId: "email-and-workflow-on-approval",
          triggeredAt: null,
        },
      ],
    }
    await triggerNextSteps(data)
    expect(prisma.workflow.create).toBeCalledTimes(0)
    expect(prisma.nextStep.update).toBeCalledTimes(0)
    expect(notifyNextStep).toBeCalledTimes(0)
  })
})
