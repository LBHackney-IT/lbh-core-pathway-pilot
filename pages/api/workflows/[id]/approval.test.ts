import { handler } from "./approval"
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
import { notifyReturnedForEdits } from "../../../../lib/notify"

jest.mock("../../../../lib/prisma", () => ({
  workflow: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
}))

jest.mock("../../../../lib/notify")

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

  it("returns 400 if user is not an approver", async () => {
    const request = {
      method: "GET",
      query: { id: mockWorkflow.id },
      session: { user: mockUser },
    } as unknown as ApiRequestWithSession

    await handler(request, response)

    expect(response.status).toHaveBeenCalledWith(400)
  })

  describe("when the HTTP method is POST", () => {
    it("searches for the workflow with the provided ID", async () => {
      const request = {
        method: "POST",
        query: { id: mockWorkflow.id },
        session: { user: mockApprover },
      } as unknown as ApiRequestWithSession

      ;(prisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow)

      await handler(request, response)

      expect(prisma.workflow.findUnique).toBeCalledWith({
        where: { id: mockWorkflow.id },
      })
    })

    describe("and the workflow needs panel authorisation i.e. already manager approved", () => {
      beforeEach(() => {
        ;(prisma.workflow.findUnique as jest.Mock).mockResolvedValue(
          mockManagerApprovedWorkflowWithExtras
        )
      })

      it("returns 400 if user isn't a panel approver", async () => {
        const request = {
          method: "POST",
          query: { id: mockWorkflow.id },
          session: { user: mockApprover },
        } as unknown as ApiRequestWithSession

        await handler(request, response)

        expect(response.status).toHaveBeenCalledWith(400)
      })

      it("updates the workflow with panel authorisation", async () => {
        const request = {
          method: "POST",
          query: { id: mockWorkflow.id },
          session: { user: mockPanelApprover },
        } as unknown as ApiRequestWithSession

        await handler(request, response)

        expect(prisma.workflow.update).toBeCalledWith({
          where: { id: mockWorkflow.id },
          data: {
            panelApprovedAt: mockDateNow,
            panelApprovedBy: mockApprover.email,
          },
        })
      })

      it("returns updated workflow", async () => {
        const request = {
          method: "POST",
          query: { id: mockWorkflow.id },
          session: { user: mockPanelApprover },
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
    })

    describe("and the workflow needs manager approval", () => {
      it("updates the workflow with manager approval", async () => {
        const request = {
          method: "POST",
          query: { id: mockWorkflow.id },
          session: { user: mockApprover },
        } as unknown as ApiRequestWithSession

        ;(prisma.workflow.findUnique as jest.Mock).mockResolvedValue(
          mockSubmittedWorkflowWithExtras
        )

        await handler(request, response)

        expect(prisma.workflow.update).toBeCalledWith({
          where: { id: mockWorkflow.id },
          data: {
            managerApprovedAt: mockDateNow,
            managerApprovedBy: mockApprover.email,
          },
          include: {
            nextSteps: true,
            creator: true,
          },
        })
      })

      it("returns updated workflow", async () => {
        const request = {
          method: "POST",
          query: { id: mockWorkflow.id },
          session: { user: mockApprover },
        } as unknown as ApiRequestWithSession

        ;(prisma.workflow.findUnique as jest.Mock).mockResolvedValue(
          mockSubmittedWorkflowWithExtras
        )

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
    })
  })

  describe("when the HTTP method is DELETE", () => {
    beforeEach(() => {
      ;(prisma.workflow.update as jest.Mock).mockResolvedValue(mockWorkflow)
    })

    it("updates the workflow with a comment i.e. return for edits", async () => {
      const request = {
        method: "DELETE",
        query: { id: mockWorkflow.id },
        session: { user: mockApprover },
        body: JSON.stringify({ reason: "Reasons for return" }),
      } as unknown as ApiRequestWithSession

      await handler(request, response)

      expect(prisma.workflow.update).toBeCalledWith({
        where: { id: mockWorkflow.id },
        data: {
          managerApprovedAt: null,
          submittedAt: null,
          comments: {
            create: {
              text: "Reasons for return",
              createdBy: mockApprover.email,
            },
          },
        },
        include: {
          creator: true,
        },
      })
    })

    it("sends an email to assignee of workflow", async () => {
      const request = {
        method: "DELETE",
        query: { id: mockWorkflow.id },
        session: { user: mockApprover },
        body: JSON.stringify({ reason: "Reasons for return" }),
      } as unknown as ApiRequestWithSession

      await handler(request, response)

      expect(notifyReturnedForEdits).toBeCalledWith(
        mockWorkflow,
        mockApprover,
        process.env.NEXTAUTH_URL,
        "Reasons for return"
      )
    })

    it("returns updated workflow", async () => {
      const request = {
        method: "DELETE",
        query: { id: mockWorkflow.id },
        session: { user: mockApprover },
        body: JSON.stringify({ reason: "Reasons for return" }),
      } as unknown as ApiRequestWithSession

      await handler(request, response)

      expect(response.json).toHaveBeenCalledWith(mockWorkflow)
    })
  })
})
