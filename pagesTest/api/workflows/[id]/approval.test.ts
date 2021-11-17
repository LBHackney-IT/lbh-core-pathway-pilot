import { handler } from "../../../../pages/api/workflows/[id]/approval"
import { ApiRequestWithSession } from "../../../../lib/apiHelpers"
import { NextApiResponse } from "next"
import {
  mockWorkflow,
  mockSubmittedWorkflowWithExtras,
  mockManagerApprovedWorkflowWithExtras,
} from "../../../../fixtures/workflows"
import prisma from "../../../../lib/prisma"
import {
  mockApprover,
  mockPanelApprover,
  mockUser,
} from "../../../../fixtures/users"
import { notifyReturnedForEdits, notifyApprover } from "../../../../lib/notify"
import { addRecordToCase } from "../../../../lib/cases"
import { triggerNextSteps } from "../../../../lib/nextSteps"
import { Actions } from "../../../../components/ManagerApprovalDialog"
import { mockResident } from "../../../../fixtures/residents"

jest.mock("../../../../lib/prisma", () => ({
  workflow: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
}))

jest.mock("../../../../lib/cases")
jest.mock("../../../../lib/notify")
jest.mock("../../../../lib/nextSteps")

console.error = jest.fn()

const mockDateNow = new Date()
jest
  .spyOn(global, "Date")
  .mockImplementation(() => mockDateNow as unknown as string)

let response

describe("/api/workflows/[id]/approval", () => {
  beforeEach(() => {
    ;(prisma.workflow.findUnique as jest.Mock).mockClear()
    ;(prisma.workflow.update as jest.Mock).mockClear()
    ;(notifyReturnedForEdits as jest.Mock).mockClear()
    ;(notifyApprover as jest.Mock).mockClear()

    response = {
      status: jest.fn().mockReturnValue({ json: jest.fn() }),
      json: jest.fn(),
    } as unknown as NextApiResponse
  })

  it("returns 405 if unsupported HTTP method", async () => {
    const request = {
      method: "GET",
      query: { id: mockWorkflow.id },
      session: { user: mockApprover },
    } as unknown as ApiRequestWithSession

    await handler(request, response)

    expect(response.status).toHaveBeenCalledWith(405)
  })

  describe("when the HTTP method is POST", () => {
    describe("and the workflow needs panel authorisation i.e. already manager approved", () => {
      beforeEach(() => {
        ;(prisma.workflow.findUnique as jest.Mock).mockResolvedValue(
          mockManagerApprovedWorkflowWithExtras
        )
        ;(prisma.workflow.update as jest.Mock).mockResolvedValue(
          mockManagerApprovedWorkflowWithExtras
        )
      })

      it("searches for the workflow with the provided ID", async () => {
        const request = {
          method: "POST",
          query: { id: mockManagerApprovedWorkflowWithExtras.id },
          session: { user: mockApprover },
        } as unknown as ApiRequestWithSession

        await handler(request, response)

        expect(prisma.workflow.findUnique).toBeCalledWith({
          where: { id: mockManagerApprovedWorkflowWithExtras.id },
        })
      })

      it("returns 400 if user isn't an approver or panel approver", async () => {
        const request = {
          method: "POST",
          query: { id: mockManagerApprovedWorkflowWithExtras.id },
          session: { user: mockUser },
        } as unknown as ApiRequestWithSession

        await handler(request, response)

        expect(response.status).toHaveBeenCalledWith(400)
      })

      it("returns 400 if user is an approver", async () => {
        const request = {
          method: "POST",
          query: { id: mockManagerApprovedWorkflowWithExtras.id },
          session: { user: mockApprover },
        } as unknown as ApiRequestWithSession

        await handler(request, response)

        expect(response.status).toHaveBeenCalledWith(400)
      })

      it("updates the workflow with panel authorisation", async () => {
        const request = {
          method: "POST",
          query: { id: mockManagerApprovedWorkflowWithExtras.id },
          session: { user: mockPanelApprover },
          body: JSON.stringify({}),
        } as unknown as ApiRequestWithSession

        await handler(request, response)

        expect(prisma.workflow.update).toBeCalledWith(
          expect.objectContaining({
            where: { id: mockManagerApprovedWorkflowWithExtras.id },
            data: expect.objectContaining({
              panelApprovedAt: mockDateNow,
              panelApprovedBy: mockApprover.email,
              revisions: expect.anything(),
            }),
          })
        )
      })

      it("includes the next steps of workflow that aren't triggered", async () => {
        const request = {
          method: "POST",
          query: { id: mockManagerApprovedWorkflowWithExtras.id },
          session: { user: mockPanelApprover },
          body: JSON.stringify({}),
        } as unknown as ApiRequestWithSession

        await handler(request, response)

        expect(prisma.workflow.update).toBeCalledWith(
          expect.objectContaining({
            where: { id: mockManagerApprovedWorkflowWithExtras.id },
            include: expect.objectContaining({
              nextSteps: {
                where: {
                  triggeredAt: null,
                },
              },
            }),
          })
        )
      })

      it("includes the creator of workflow", async () => {
        const request = {
          method: "POST",
          query: { id: mockManagerApprovedWorkflowWithExtras.id },
          session: { user: mockPanelApprover },
          body: JSON.stringify({}),
        } as unknown as ApiRequestWithSession

        await handler(request, response)

        expect(prisma.workflow.update).toBeCalledWith(
          expect.objectContaining({
            where: { id: mockManagerApprovedWorkflowWithExtras.id },
            include: expect.objectContaining({
              creator: true,
            }),
          })
        )
      })

      it("returns updated workflow", async () => {
        const request = {
          method: "POST",
          query: { id: mockManagerApprovedWorkflowWithExtras.id },
          session: { user: mockPanelApprover },
          body: JSON.stringify({}),
        } as unknown as ApiRequestWithSession

        const expectedUpdatedWorkflow = {
          ...mockManagerApprovedWorkflowWithExtras,
          panelApprovedAt: mockDateNow,
          panelApprovedBy: mockApprover.email,
        }

        ;(prisma.workflow.update as jest.Mock).mockResolvedValue(
          expectedUpdatedWorkflow
        )

        await handler(request, response)

        expect(response.json).toHaveBeenCalledWith(expectedUpdatedWorkflow)
      })

      it("triggers next steps for the workflow", async () => {
        const request = {
          method: "POST",
          query: { id: mockManagerApprovedWorkflowWithExtras.id },
          session: { user: mockApprover },
          body: JSON.stringify({}),
        } as unknown as ApiRequestWithSession

        await handler(request, response)

        expect(triggerNextSteps).toBeCalledWith(
          mockManagerApprovedWorkflowWithExtras
        )
      })
    })

    describe("and the workflow needs manager approval", () => {
      beforeEach(() => {
        ;(prisma.workflow.findUnique as jest.Mock).mockResolvedValue(
          mockSubmittedWorkflowWithExtras
        )
        ;(prisma.workflow.update as jest.Mock).mockResolvedValue(
          mockSubmittedWorkflowWithExtras
        )
      })

      it("returns 400 if user isn't an approver or panel approver", async () => {
        const request = {
          method: "POST",
          query: { id: mockSubmittedWorkflowWithExtras.id },
          session: { user: mockUser },
        } as unknown as ApiRequestWithSession

        await handler(request, response)

        expect(response.status).toHaveBeenCalledWith(400)
      })

      it("returns 400 if user is a panel approver", async () => {
        const request = {
          method: "POST",
          query: { id: mockSubmittedWorkflowWithExtras.id },
          session: { user: mockPanelApprover },
        } as unknown as ApiRequestWithSession

        await handler(request, response)

        expect(response.status).toHaveBeenCalledWith(400)
      })

      it("searches for the workflow with the provided ID", async () => {
        const request = {
          method: "POST",
          query: { id: mockSubmittedWorkflowWithExtras.id },
          session: { user: mockApprover },
          body: JSON.stringify({
            panelApproverEmail: mockPanelApprover.email,
            action: Actions.ApproveWithQam,
          }),
        } as unknown as ApiRequestWithSession

        await handler(request, response)

        expect(prisma.workflow.findUnique).toBeCalledWith({
          where: { id: mockSubmittedWorkflowWithExtras.id },
        })
      })

      it("updates the workflow with manager approval", async () => {
        const request = {
          method: "POST",
          query: { id: mockSubmittedWorkflowWithExtras.id },
          session: { user: mockApprover },
          body: JSON.stringify({
            panelApproverEmail: mockPanelApprover.email,
            action: Actions.ApproveWithQam,
          }),
        } as unknown as ApiRequestWithSession

        await handler(request, response)

        expect(prisma.workflow.update).toBeCalledWith(
          expect.objectContaining({
            where: { id: mockSubmittedWorkflowWithExtras.id },
            data: {
              managerApprovedAt: mockDateNow,
              managerApprovedBy: mockApprover.email,
              assignedTo: mockPanelApprover.email,
              needsPanelApproval: true,
              revisions: expect.anything(),
            },
          })
        )
      })

      it("includes the next steps of workflow that aren't triggered", async () => {
        const request = {
          method: "POST",
          query: { id: mockSubmittedWorkflowWithExtras.id },
          session: { user: mockApprover },
          body: JSON.stringify({
            panelApproverEmail: mockPanelApprover.email,
            action: Actions.ApproveWithQam,
          }),
        } as unknown as ApiRequestWithSession

        await handler(request, response)

        expect(prisma.workflow.update).toBeCalledWith(
          expect.objectContaining({
            where: { id: mockSubmittedWorkflowWithExtras.id },
            include: expect.objectContaining({
              nextSteps: {
                where: {
                  triggeredAt: null,
                },
              },
            }),
          })
        )
      })

      it("includes the creator of workflow", async () => {
        const request = {
          method: "POST",
          query: { id: mockSubmittedWorkflowWithExtras.id },
          session: { user: mockApprover },
          body: JSON.stringify({
            panelApproverEmail: mockPanelApprover.email,
            action: Actions.ApproveWithQam,
          }),
        } as unknown as ApiRequestWithSession

        await handler(request, response)

        expect(prisma.workflow.update).toBeCalledWith(
          expect.objectContaining({
            where: { id: mockSubmittedWorkflowWithExtras.id },
            include: expect.objectContaining({
              creator: true,
            }),
          })
        )
      })

      it("sets needs panel approval to false if approval without QAM ", async () => {
        const request = {
          method: "POST",
          query: { id: mockSubmittedWorkflowWithExtras.id },
          session: { user: mockApprover },
          body: JSON.stringify({
            panelApproverEmail: "",
            action: Actions.ApproveWithoutQam,
          }),
        } as unknown as ApiRequestWithSession

        await handler(request, response)

        expect(prisma.workflow.update).toBeCalledWith(
          expect.objectContaining({
            where: { id: mockSubmittedWorkflowWithExtras.id },
            data: expect.objectContaining({
              managerApprovedAt: mockDateNow,
              managerApprovedBy: mockApprover.email,
              needsPanelApproval: false,
            }),
          })
        )
      })

      it("doesn't reassign if approval without QAM ", async () => {
        const request = {
          method: "POST",
          query: { id: mockSubmittedWorkflowWithExtras.id },
          session: { user: mockApprover },
          body: JSON.stringify({
            panelApproverEmail: mockPanelApprover.email,
            action: Actions.ApproveWithoutQam,
          }),
        } as unknown as ApiRequestWithSession

        await handler(request, response)

        expect(prisma.workflow.update).toBeCalledWith(
          expect.objectContaining({
            where: { id: mockSubmittedWorkflowWithExtras.id },
            data: expect.not.objectContaining({
              assignedTo: mockPanelApprover.email,
            }),
          })
        )
      })

      it("returns updated workflow", async () => {
        const request = {
          method: "POST",
          query: { id: mockSubmittedWorkflowWithExtras.id },
          session: { user: mockApprover },
          body: JSON.stringify({
            panelApproverEmail: mockPanelApprover.email,
            action: Actions.ApproveWithQam,
          }),
        } as unknown as ApiRequestWithSession

        const expectedUpdatedWorkflow = {
          ...mockSubmittedWorkflowWithExtras,
          panelApprovedAt: mockDateNow,
          panelApprovedBy: mockApprover.email,
        }

        ;(prisma.workflow.update as jest.Mock).mockResolvedValue(
          expectedUpdatedWorkflow
        )

        await handler(request, response)

        expect(response.json).toHaveBeenCalledWith(expectedUpdatedWorkflow)
      })

      it("sends an approval email to assignee of workflow", async () => {
        const request = {
          method: "POST",
          query: { id: mockSubmittedWorkflowWithExtras.id },
          session: { user: mockApprover },
          body: JSON.stringify({
            panelApproverEmail: mockPanelApprover.email,
            action: Actions.ApproveWithQam,
          }),
        } as unknown as ApiRequestWithSession

        await handler(request, response)

        expect(notifyApprover).toBeCalledWith(
          mockSubmittedWorkflowWithExtras,
          mockPanelApprover.email,
          process.env.NEXTAUTH_URL
        )
      })

      it("triggers next steps for the workflow", async () => {
        const request = {
          method: "POST",
          query: { id: mockSubmittedWorkflowWithExtras.id },
          session: { user: mockApprover },
          body: JSON.stringify({
            panelApproverEmail: mockPanelApprover.email,
            action: Actions.ApproveWithQam,
          }),
        } as unknown as ApiRequestWithSession

        await handler(request, response)

        expect(triggerNextSteps).toBeCalledWith(mockSubmittedWorkflowWithExtras)
      })
    })
  })

  describe("when the HTTP method is DELETE", () => {
    beforeEach(() => {
      ;(prisma.workflow.update as jest.Mock).mockResolvedValue(
        mockSubmittedWorkflowWithExtras
      )
    })

    it("returns 400 if user isn't an approver or panel approver", async () => {
      const request = {
        method: "DELETE",
        query: { id: mockSubmittedWorkflowWithExtras.id },
        session: { user: mockUser },
        body: JSON.stringify({ reason: "Reasons for return" }),
      } as unknown as ApiRequestWithSession

      await handler(request, response)

      expect(response.status).toHaveBeenCalledWith(400)
    })

    it("doesn't return 400 if user is an approver", async () => {
      const request = {
        method: "DELETE",
        query: { id: mockSubmittedWorkflowWithExtras.id },
        session: { user: mockApprover },
        body: JSON.stringify({ reason: "Reasons for return" }),
      } as unknown as ApiRequestWithSession

      await handler(request, response)

      expect(response.status).not.toHaveBeenCalledWith(400)
    })

    it("doesn't return 400 if user is a panel approver", async () => {
      const request = {
        method: "DELETE",
        query: { id: mockSubmittedWorkflowWithExtras.id },
        session: { user: mockPanelApprover },
        body: JSON.stringify({ reason: "Reasons for return" }),
      } as unknown as ApiRequestWithSession

      await handler(request, response)

      expect(response.status).not.toHaveBeenCalledWith(400)
    })

    it("updates the workflow of the provided ID", async () => {
      const request = {
        method: "DELETE",
        query: { id: mockSubmittedWorkflowWithExtras.id },
        session: { user: mockApprover },
        body: JSON.stringify({ reason: "Reasons for return" }),
      } as unknown as ApiRequestWithSession

      await handler(request, response)

      expect(prisma.workflow.update).toBeCalledWith(
        expect.objectContaining({
          where: { id: mockSubmittedWorkflowWithExtras.id },
        })
      )
    })

    it("updates the workflow to no longer be approved", async () => {
      const request = {
        method: "DELETE",
        query: { id: mockSubmittedWorkflowWithExtras.id },
        session: { user: mockApprover },
        body: JSON.stringify({ reason: "Reasons for return" }),
      } as unknown as ApiRequestWithSession

      await handler(request, response)

      expect(prisma.workflow.update).toBeCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            managerApprovedAt: null,
          }),
        })
      )
    })

    it("updates the workflow to no longer be submitted", async () => {
      const request = {
        method: "DELETE",
        query: { id: mockSubmittedWorkflowWithExtras.id },
        session: { user: mockApprover },
        body: JSON.stringify({ reason: "Reasons for return" }),
      } as unknown as ApiRequestWithSession

      await handler(request, response)

      expect(prisma.workflow.update).toBeCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            submittedAt: null,
          }),
        })
      )
    })

    it("updates the workflow with the provided comments by current user", async () => {
      const request = {
        method: "DELETE",
        query: { id: mockSubmittedWorkflowWithExtras.id },
        session: { user: mockApprover },
        body: JSON.stringify({ reason: "Reasons for return" }),
      } as unknown as ApiRequestWithSession

      await handler(request, response)

      expect(prisma.workflow.update).toBeCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            comments: {
              create: {
                text: "Reasons for return",
                createdBy: mockApprover.email,
              },
            },
          }),
        })
      )
    })

    it("includes the creator when updating the workflow", async () => {
      const request = {
        method: "DELETE",
        query: { id: mockSubmittedWorkflowWithExtras.id },
        session: { user: mockApprover },
        body: JSON.stringify({ reason: "Reasons for return" }),
      } as unknown as ApiRequestWithSession

      await handler(request, response)

      expect(prisma.workflow.update).toBeCalledWith(
        expect.objectContaining({
          include: {
            creator: true,
          },
        })
      )
    })

    it("assigns workflow to submitter", async () => {
      const request = {
        method: "DELETE",
        query: { id: mockSubmittedWorkflowWithExtras.id },
        session: { user: mockApprover },
        body: JSON.stringify({ reason: "Reasons for return" }),
      } as unknown as ApiRequestWithSession

      await handler(request, response)

      expect(prisma.workflow.update).toBeCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            assignedTo: mockSubmittedWorkflowWithExtras.submittedBy,
          }),
        })
      )
    })

    it("sends a returned for edits email to assignee of workflow", async () => {
      const request = {
        method: "DELETE",
        query: { id: mockSubmittedWorkflowWithExtras.id },
        session: { user: mockApprover },
        body: JSON.stringify({ reason: "Reasons for return" }),
      } as unknown as ApiRequestWithSession

      await handler(request, response)

      expect(notifyReturnedForEdits).toBeCalledWith(
        mockSubmittedWorkflowWithExtras,
        mockApprover,
        process.env.NEXTAUTH_URL,
        "Reasons for return"
      )
    })

    it("returns updated workflow", async () => {
      const request = {
        method: "DELETE",
        query: { id: mockSubmittedWorkflowWithExtras.id },
        session: { user: mockApprover },
        body: JSON.stringify({ reason: "Reasons for return" }),
      } as unknown as ApiRequestWithSession

      await handler(request, response)

      expect(response.json).toHaveBeenCalledWith(
        mockSubmittedWorkflowWithExtras
      )
    })
  })
})
