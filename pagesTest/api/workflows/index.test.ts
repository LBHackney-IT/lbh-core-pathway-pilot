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
import { defaultPerPage as perPage } from "../../../config"

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
      ;(prisma.workflow.count as jest.Mock).mockClear()
      ;(prisma.workflow.count as jest.Mock).mockResolvedValue(20)
      ;(prisma.workflow.findMany as jest.Mock).mockClear()
      ;(prisma.workflow.findMany as jest.Mock).mockResolvedValue([mockWorkflow])
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

    it("calls Prisma to find workflows that aren't historic or discarded by default", async () => {
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

    describe("and page is set for pagination", () => {
      it("calls Prisma to only take configured page amount", async () => {
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
            take: perPage,
          })
        )
      })

      it("calls Prisma to skip 0 if page is 0", async () => {
        await handler(
          makeNextApiRequest({
            method: "GET",
            query: { page: "0" },
            session: mockSession,
          }),
          response
        )

        expect(prisma.workflow.findMany).toBeCalledWith(
          expect.objectContaining({
            skip: 0,
          })
        )
      })

      it("calls Prisma to skip workflows based on page", async () => {
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
            skip: 40,
          })
        )
      })

      it("calls Prisma to count the number of workflows", async () => {
        await handler(
          makeNextApiRequest({
            method: "GET",
            query: { page: "2" },
            session: mockSession,
          }),
          response
        )

        expect(prisma.workflow.count).toBeCalled()
      })
    })

    describe("and show historic data is true", () => {
      it("calls Prisma to find workflows without restrictions on type", async () => {
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
    })

    describe("and social care ID is set", () => {
      it("calls Prisma to find workflows with a specific social care ID", async () => {
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
    })

    describe("and quick filter is set to 'me' and touched by me is true", () => {
      it("calls Prisma to find workflows touched by me", async () => {
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
    })

    describe("and quick filter is set to 'me' without touched by me", () => {
      it("calls Prisma to find workflows assigned to me", async () => {
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

    describe("and quick filter is set to 'my-team'", () => {
      it("calls Prisma to find workflows team assigned to the current user's team", async () => {
        await handler(
          makeNextApiRequest({
            method: "GET",
            query: {
              quick_filter: "my-team",
            },
            session: mockSession,
          }),
          response
        )

        expect(prisma.workflow.findMany).toBeCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              teamAssignedTo: mockUser.team,
            }),
          })
        )
      })
    })

    describe("and quick filter is set to 'another-team'", () => {
      it("calls Prisma to find workflows team assigned to the team provided", async () => {
        await handler(
          makeNextApiRequest({
            method: "GET",
            query: {
              quick_filter: "another-team",
              team_assigned_to: "some-team-name",
            },
            session: mockSession,
          }),
          response
        )

        expect(prisma.workflow.findMany).toBeCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              teamAssignedTo: "some-team-name",
            }),
          })
        )
      })
    })

    describe("and quick filter is set to 'another-user'", () => {
      it("calls Prisma to find workflows assigned to the user provided", async () => {
        await handler(
          makeNextApiRequest({
            method: "GET",
            query: {
              quick_filter: "another-user",
              assigned_to: "test@example.com",
            },
            session: mockSession,
          }),
          response
        )

        expect(prisma.workflow.findMany).toBeCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              assignedTo: "test@example.com",
            }),
          })
        )
      })
    })

    it("returns 200 with each workflow and its form and the count", async () => {
      await handler(
        makeNextApiRequest({
          method: "GET",
          query: {},
          session: mockSession,
        }),
        response
      )

      expect(response.json).toBeCalledWith(
        expect.objectContaining({
          workflows: expect.arrayContaining([
            expect.objectContaining({
              id: mockWorkflow.id,
              form: mockForm,
            }),
          ]),
          count: 20,
        })
      )
    })
  })

  describe("when the HTTP method is POST", () => {
    const body = { socialCareId: mockResident.mosaicId, formId: mockForm.id }
    let response
    let validate

    describe("and the resident ID in the request exists", () => {
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

      it("returns 201 with the created workflow", () => {
        expect(response.status).toBeCalledWith(201)
        expect(response.json).toBeCalledWith(mockWorkflow)
      })
    })

    describe("and the resident ID in the request doesn't exist", () => {
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
