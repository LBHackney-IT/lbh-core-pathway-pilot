import {mockWorkflowWithExtras} from "../fixtures/workflows"
import {triggerNextSteps} from "./nextSteps"
import prisma from "./prisma"
import {notifyNextStep} from "./notify"
import {Team} from ".prisma/client"
import {mockNextStep} from "../fixtures/nextSteps"
import {getResidentById} from "./residents";
import {mockResident} from "../fixtures/residents";
import fetch from "node-fetch";
import {mockForm} from "../fixtures/form";

const TEMP_CONSOLE = console

console.error = jest.fn()
console.log = jest.fn()

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

jest.mock("node-fetch")

;(fetch as unknown as jest.Mock).mockImplementation(async () => ({
  text: jest.fn().mockResolvedValue('a response'),
  status: 200,
}))

jest.mock('./residents', () => ({
  getResidentById: jest.fn(),
}))

;(getResidentById as jest.Mock).mockResolvedValue(mockResident)

beforeEach(() => {
  ;(console.error as jest.Mock).mockClear()
  ;(console.log as jest.Mock).mockClear()
  ;(fetch as unknown as jest.Mock).mockClear()
  ;(prisma.workflow.create as jest.Mock).mockClear()
  ;(prisma.nextStep.update as jest.Mock).mockClear()
  ;(notifyNextStep as jest.Mock).mockClear()
})

afterAll(() => {
  console.log = TEMP_CONSOLE.log;
  console.error = TEMP_CONSOLE.error;
})

describe("nextSteps", () => {
  it("does nothing if no next steps", async () => {
    await triggerNextSteps({...mockWorkflowWithExtras, nextSteps: undefined})
    expect(console.error).toBeCalledTimes(0)
    expect(prisma.workflow.create).toBeCalledTimes(0)
    expect(prisma.nextStep.update).toBeCalledTimes(0)
    expect(notifyNextStep).toBeCalledTimes(0)
  })

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
      data: {triggeredAt: new Date()},
      where: {id: mockWorkflowWithExtras.id},
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
      process.env.APP_URL,
      "Example note",
      "Example next step 3"
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
        workflowId: "123abc",
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

  it("waits for QAM approval if needed", async () => {
    const data = {
      ...mockWorkflowWithExtras,
      managerApprovedAt: new Date(),
      panelApprovedAt: null,
      nextSteps: [
        {
          ...mockNextStep,
          nextStepOptionId: "email-on-qam-approval",
          triggeredAt: null,
        },
      ],
    }

    await triggerNextSteps(data)

    expect(prisma.workflow.create).toBeCalledTimes(0)
    expect(prisma.nextStep.update).toBeCalledTimes(0)
    expect(notifyNextStep).toBeCalledTimes(0)
  })

  it("sends email if wait for QAM approval and is QAM approved", async () => {
    const data = {
      ...mockWorkflowWithExtras,
      managerApprovedAt: new Date(),
      panelApprovedAt: new Date(),
      nextSteps: [
        {
          ...mockNextStep,
          nextStepOptionId: "email-on-qam-approval",
          triggeredAt: null,
        },
      ],
    }

    await triggerNextSteps(data)

    expect(prisma.workflow.create).toBeCalledTimes(0)
    expect(prisma.nextStep.update).toBeCalledTimes(1)
    expect(notifyNextStep).toBeCalledTimes(1)
  })

  describe('when a next step has a webhook attached', () => {
    it('calls the webhook matching the environment', async () => {
      await triggerNextSteps({
          ...mockWorkflowWithExtras,
          answers: {
            "Theme": {
              "Question": "Answer",
              "Primary support reason": "A reason for support",
              "Will direct payments be involved in managing my budget?": "Yes",
            },
          },
          managerApprovedAt: new Date(),
          panelApprovedAt: new Date(),
          nextSteps: [{
            id: 'test-next-step',
            nextStepOptionId: 'webhook-on-qam-approval',
            workflowId: mockWorkflowWithExtras.id,
            altSocialCareId: null,
            note: 'test note',
            triggeredAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          }]
        },
        "test-cookie",
      );
      expect(console.error).not.toHaveBeenCalled()
      expect(prisma.workflow.create).not.toHaveBeenCalled()
      expect(fetch).toHaveBeenCalledWith("https://example.com", {
        body: JSON.stringify({
          workflowId: mockWorkflowWithExtras.id,
          workflowType: mockWorkflowWithExtras.type,
          socialCareId: mockWorkflowWithExtras.socialCareId,
          residentName: `${mockResident.firstName} ${mockResident.lastName}`,
          urgentSince: mockWorkflowWithExtras.heldAt,
          formName: mockForm.name,
          note: 'test note',
          primarySupportReason: 'A reason for support',
          directPayments: 'Yes',
        }),
        headers: {
          Authorization: "Bearer test-cookie",
          "Content-Type": "application/json",
          Cookie: "testToken=test-cookie"
        },
        method: "POST",
      })
      expect(console.log).toHaveBeenCalledWith("[nextsteps][webhook] step test-next-step of workflow 123abc (200: \"a response\")")
      expect(prisma.nextStep.update).toHaveBeenCalledWith({
        data: {triggeredAt: {}},
        where: {id: "test-next-step"}
      })
      expect(notifyNextStep).not.toHaveBeenCalled()
    });

    it('does not call the webhook when no matching environment found', async () => {
      await triggerNextSteps({
          ...mockWorkflowWithExtras,
          managerApprovedAt: new Date(),
          panelApprovedAt: new Date(),
          nextSteps: [{
            id: 'test-next-step',
            nextStepOptionId: 'webhook-on-qam-approval-for-other-env',
            workflowId: mockWorkflowWithExtras.id,
            altSocialCareId: null,
            note: 'test note',
            triggeredAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          }]
        },
        "test-cookie",
      );
      expect(console.error).not.toHaveBeenCalled()
      expect(prisma.workflow.create).not.toHaveBeenCalled()
      expect(fetch).not.toHaveBeenCalled();
      expect(prisma.nextStep.update).toHaveBeenCalledWith({
        data: {triggeredAt: {}},
        where: {id: "test-next-step"}
      })
      expect(notifyNextStep).not.toHaveBeenCalled()
    });
  });
})
