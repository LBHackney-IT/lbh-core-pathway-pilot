import { handler } from "../../../pages/api/workflows"
import { NextApiResponse } from "next"
import { mockWorkflow } from "../../../fixtures/workflows"
import prisma from "../../../lib/prisma"
import { mockUser } from "../../../fixtures/users"
import { mockResident } from "../../../fixtures/residents"
import { mockForm } from "../../../fixtures/form"
import { newWorkflowSchema } from "../../../lib/validators"
import { getResidentById } from "../../../lib/residents"
import {
  makeNextApiRequest,
  testApiHandlerUnsupportedMethods,
} from "../../../lib/auth/test-functions"
import { mockSession } from "../../../fixtures/session"

jest.mock("../../../lib/prisma", () => ({
  workflow: {
    create: jest.fn(),
    findMany: jest.fn().mockResolvedValue([]),
    count: jest.fn(),
  },
}))

jest.mock("../../../lib/residents")
;(getResidentById as jest.Mock).mockResolvedValue(mockResident)

jest.mock("../../../lib/validators")

describe("pages/api/workflows", () => {
  testApiHandlerUnsupportedMethods(handler, ["GET", "POST"])

  describe("when the HTTP method is GET", () => {
    let response
    let validate

    beforeEach(() => {
      ;(prisma.workflow.create as jest.Mock).mockClear()
      ;(prisma.workflow.create as jest.Mock).mockResolvedValue(mockWorkflow)

      validate = jest.fn().mockResolvedValue({
        socialCareId: mockResident.mosaicId,
        formId: mockForm.id,
      })
      ;(newWorkflowSchema as jest.Mock).mockClear()
      ;(newWorkflowSchema as jest.Mock).mockImplementation(() => ({ validate }))

      response = {
        status: jest.fn().mockImplementation(() => response),
        json: jest.fn(),
      } as unknown as NextApiResponse
    })

    it("correctly paginates the response", async () => {
      await handler(
        makeNextApiRequest({
          method: "GET",
          query: { page: "2" },
          session: mockSession,
        }),
        response
      )

      expect(prisma.workflow.findMany).toBeCalledWith(
        expect.objectContaining({
          take: 20,
          skip: 40,
        })
      )
      expect(prisma.workflow.count).toBeCalledTimes(1)
    })

    it("doesn't return historic or discarded data by default", async () => {
      await handler(
        makeNextApiRequest({
          method: "GET",
          query: {},
          session: mockSession,
        }),
        response
      )

      expect(prisma.workflow.findMany).toBeCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            type: { in: ["Reassessment", "Review", "Assessment"] },
            discardedAt: null,
          }),
        })
      )
    })

    it("can return historic data", async () => {
      await handler(
        makeNextApiRequest({
          method: "GET",
          query: {
            show_historic: "true",
          },
          session: mockSession,
        }),
        response
      )

      expect(prisma.workflow.findMany).toBeCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            type: undefined,
          }),
        })
      )
    })

    it("can return data for a specific social care id", async () => {
      await handler(
        makeNextApiRequest({
          method: "GET",
          query: {
            social_care_id: "foo",
          },
          session: mockSession,
        }),
        response
      )

      expect(prisma.workflow.findMany).toBeCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            socialCareId: "foo",
          }),
        })
      )
    })

    it("runs things touched by me", async () => {
      await handler(
        makeNextApiRequest({
          method: "GET",
          query: {
            quick_filter: "me",
            touched_by_me: "true",
          },
          session: mockSession,
        }),
        response
      )

      expect(prisma.workflow.findMany).toBeCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.arrayContaining([
              {
                OR: [
                  { assignedTo: mockUser.email },
                  { createdBy: mockUser.email },
                  { submittedBy: mockUser.email },
                  { managerApprovedBy: mockUser.email },
                  { panelApprovedBy: mockUser.email },
                  { acknowledgedBy: mockUser.email },
                ],
              },
            ]),
          }),
        })
      )
    })

    it("returns things assigned to me", async () => {
      await handler(
        makeNextApiRequest({
          method: "GET",
          query: {
            quick_filter: "me",
          },
          session: mockSession,
        }),
        response
      )

      expect(prisma.workflow.findMany).toBeCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            assignedTo: mockUser.email,
          }),
        })
      )
    })
  })

  describe("when the HTTP method is POST", () => {
    const body = { socialCareId: mockResident.mosaicId, formId: mockForm.id }
    let response
    let validate

    describe("when the resident ID in the request exists", () => {
      beforeAll(async () => {
        ;(prisma.workflow.create as jest.Mock).mockResolvedValue(mockWorkflow)

        validate = jest.fn().mockResolvedValue({
          socialCareId: mockResident.mosaicId,
          formId: mockForm.id,
        })
        ;(newWorkflowSchema as jest.Mock).mockImplementation(() => ({
          validate,
        }))

        response = {
          status: jest.fn().mockImplementation(() => response),
          json: jest.fn(),
        } as unknown as NextApiResponse

        await handler(
          makeNextApiRequest({
            method: "POST",
            body,
            session: mockSession,
          }),
          response
        )
      })

      it("validates the request", () => {
        expect(validate).toBeCalledWith(body)
      })

      it("creates a new workflow with provided data", () => {
        expect(prisma.workflow.create).toBeCalledWith({
          data: expect.objectContaining({
            socialCareId: body.socialCareId,
            formId: body.formId,
          }),
        })
      })

      it("creates a new workflow with it created by the current user", () => {
        expect(prisma.workflow.create).toBeCalledWith({
          data: expect.objectContaining({
            createdBy: mockUser.email,
          }),
        })
      })

      it("creates a new workflow with it updated by the current user", () => {
        expect(prisma.workflow.create).toBeCalledWith({
          data: expect.objectContaining({
            updatedBy: mockUser.email,
          }),
        })
      })

      it("creates a new workflow with it assigned to the current user", () => {
        expect(prisma.workflow.create).toBeCalledWith({
          data: expect.objectContaining({
            assignedTo: mockUser.email,
          }),
        })
      })

      it("creates a new workflow with it team assigned to the current user's team", () => {
        expect(prisma.workflow.create).toBeCalledWith({
          data: expect.objectContaining({
            teamAssignedTo: mockUser.team,
          }),
        })
      })

      it("returns 200 with the created workflow", () => {
        expect(response.status).toBeCalledWith(201)
        expect(response.json).toBeCalledWith(mockWorkflow)
      })
    })

    describe("when the resident ID in the request doesn't exist", () => {
      beforeAll(async () => {
        response = {
          status: jest.fn().mockImplementation(() => response),
          json: jest.fn(),
        } as unknown as NextApiResponse
        ;(getResidentById as jest.Mock).mockResolvedValue(null)

        await handler(
          makeNextApiRequest({
            method: "POST",
            body,
            session: mockSession,
          }),
          response
        )
      })

      it("returns a not found error", () => {
        expect(response.status).toBeCalledWith(404)
        expect(response.json).toBeCalledWith({
          error: "Resident does not exist.",
        })
      })
    })
  })
})
