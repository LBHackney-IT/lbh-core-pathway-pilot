import prisma from "../../../../lib/prisma"
import {
  mockManagerApprovedWorkflowWithExtras,
  mockSubmittedWorkflowWithExtras,
  mockWorkflowWithExtras
} from "../../../../fixtures/workflows";
import {mockSession} from "../../../../fixtures/session";
import {mockApprover, mockUser} from "../../../../fixtures/users";
import {NextApiResponse} from "next";
import {handler} from "../../../../pages/api/workflows/[id]/finish";
import {makeNextApiRequest} from "../../../../lib/auth/test-functions";
import {notifyApprover} from "../../../../lib/notify";
import {triggerNextSteps} from "../../../../lib/nextSteps";

jest.mock("../../../../lib/nextSteps")
jest.mock("../../../../lib/notify")

jest.mock("../../../../lib/prisma", () => ({
  nextStep: {
    deleteMany: jest.fn()
  },
  workflow: {
    update: jest.fn(),
    findUnique: jest.fn(),
  }
}))

const mockDateNow = new Date()
jest
  .spyOn(global, "Date")
  .mockImplementation(() => mockDateNow as unknown as string)

const response = {
  status: jest.fn().mockImplementation(() => response),
  json: jest.fn(),
} as unknown as NextApiResponse

describe('pages/api/workflows/[id]/finish', () => {
  beforeAll(async () => {
    ;(prisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflowWithExtras)
    ;(prisma.workflow.update as jest.Mock).mockResolvedValue(mockSubmittedWorkflowWithExtras)

    await handler(makeNextApiRequest({
        method: 'POST',
        query: {id: mockSubmittedWorkflowWithExtras.id},
        session: mockSession,
        body: {
          approverEmail: "approver.email@test.com",
          nextSteps: mockSubmittedWorkflowWithExtras.nextSteps,
        },
      }),
      response);
  })

  const expectedNextSteps = mockSubmittedWorkflowWithExtras.nextSteps.map(nextStep => (
    {
      nextStepOptionId: nextStep.nextStepOptionId,
      altSocialCareId: nextStep.altSocialCareId,
      note: nextStep.note,
    }
  ))

  it("should delete next steps to prevent duplicates", () => {
    expect(prisma.nextStep.deleteMany).toHaveBeenCalledWith(
      {where: {workflowId: mockSubmittedWorkflowWithExtras.id}}
    )
  })

  it("updates the workflow with with the correct submission information", () => {
    expect(prisma.workflow.update).toBeCalledWith(
      expect.objectContaining({
        where: {id: mockSubmittedWorkflowWithExtras.id},
        data: expect.objectContaining({
          submittedAt: mockDateNow,
          submittedBy: mockUser.email,
          teamSubmittedBy: mockUser.team,
          reviewBefore: mockDateNow,
          assignedTo: "approver.email@test.com",
          nextSteps: {
            createMany: {
              data: expect.arrayContaining(expectedNextSteps)
            }
          },
          revisions: {
            create: {
              answers: {},
              createdBy: mockUser.email,
              action: 'Submitted',
            }
          },
        })
      }))
  })

  it("updates the workflow with with the correct submission information if there is no approver email passed it will use the submittedBy email", async () => {
    await handler(makeNextApiRequest({
        method: 'POST',
        query: {id: mockSubmittedWorkflowWithExtras.id},
        session: mockSession,
        body:{
          nextSteps: mockSubmittedWorkflowWithExtras.nextSteps,
        },
      }),
      response);
    expect(prisma.workflow.update).toBeCalledWith(
      expect.objectContaining({
        where: {id: mockSubmittedWorkflowWithExtras.id},
        data: expect.objectContaining({
          submittedAt: mockDateNow,
          submittedBy: mockUser.email,
          teamSubmittedBy: mockUser.team,
          reviewBefore: mockDateNow,
          assignedTo: mockUser.email,
          nextSteps: {
            createMany: {
              data: expect.arrayContaining(expectedNextSteps)
            }
          },
          revisions: {
            create: {
              answers: {},
              createdBy: mockUser.email,
              action: 'Submitted',
            }
          },
        })
      }))
  })

  it("includes the next steps of the workflow that aren't triggered", () => {
    expect(prisma.workflow.update).toBeCalledWith(
      expect.objectContaining({
        where: {id: mockSubmittedWorkflowWithExtras.id},
        include: expect.objectContaining({
          nextSteps: {
            where: {
              triggeredAt: null,
            }
          }
        })
      }))
  })

  it("includes the creator of workflow", () => {
    expect(prisma.workflow.update).toBeCalledWith(
      expect.objectContaining({
        where: {id: mockManagerApprovedWorkflowWithExtras.id},
        include: expect.objectContaining({
          creator: true,
        }),
      })
    )
  })

  it("sends an approval email to assignee of workflow", () => {
    expect(notifyApprover).toBeCalledWith(
      mockSubmittedWorkflowWithExtras,
      "approver.email@test.com",
      process.env.APP_URL
    )
  });

  it("triggers next steps for the workflow", () => {
    expect(triggerNextSteps).toHaveBeenCalledWith(mockSubmittedWorkflowWithExtras)
  })

  it("returns the updated workflow", () => {
    expect(response.json).toHaveBeenCalledWith(mockSubmittedWorkflowWithExtras)
  })
})
