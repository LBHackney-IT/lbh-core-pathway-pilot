import { handler } from "../../../pages/api/workflows/index"
import { ApiRequestWithSession } from "../../../lib/apiHelpers"
import { NextApiResponse } from "next"
import { mockWorkflow } from "../../../fixtures/workflows"
import prisma from "../../../lib/prisma"
import { mockUser } from "../../../fixtures/users"
import { mockResident } from "../../../fixtures/residents"
import { mockForm } from "../../../fixtures/form"
import { newWorkflowSchema } from "../../../lib/validators"
import {getResidentById} from "../../../lib/residents";

jest.mock("../../../lib/prisma", () => ({
  workflow: {
    create: jest.fn(),
  },
}))

jest.mock("../../../lib/residents");
(getResidentById as jest.Mock).mockResolvedValue(mockResident);

jest.mock("../../../lib/validators")

describe("when the HTTP method is POST", () => {
  const body = { socialCareId: mockResident.mosaicId, formId: mockForm.id }
  let response
  let validate

  beforeEach(() => {
    ;(prisma.workflow.create as jest.Mock).mockClear()
    ;(prisma.workflow.create as jest.Mock).mockResolvedValue(mockWorkflow)

    validate = jest
      .fn()
      .mockResolvedValue({
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

  it("validates the request", async () => {
    const request = {
      method: "POST",
      body: JSON.stringify(body),
      session: { user: mockUser },
    } as unknown as ApiRequestWithSession

    await handler(request, response)

    expect(validate).toBeCalledWith(body)
  })

  it("creates a new workflow with provided data", async () => {
    const request = {
      method: "POST",
      body: JSON.stringify(body),
      session: { user: mockUser },
    } as unknown as ApiRequestWithSession

    await handler(request, response)

    expect(prisma.workflow.create).toBeCalledWith({
      data: expect.objectContaining({
        socialCareId: body.socialCareId,
        formId: body.formId,
      }),
    })
  })

  it("creates a new workflow with it created by the current user", async () => {
    const request = {
      method: "POST",
      body: JSON.stringify(body),
      session: { user: mockUser },
    } as unknown as ApiRequestWithSession

    await handler(request, response)

    expect(prisma.workflow.create).toBeCalledWith({
      data: expect.objectContaining({
        createdBy: mockUser.email,
      }),
    })
  })

  it("creates a new workflow with it updated by the current user", async () => {
    const request = {
      method: "POST",
      body: JSON.stringify(body),
      session: { user: mockUser },
    } as unknown as ApiRequestWithSession

    await handler(request, response)

    expect(prisma.workflow.create).toBeCalledWith({
      data: expect.objectContaining({
        updatedBy: mockUser.email,
      }),
    })
  })

  it("creates a new workflow with it assigned to the current user", async () => {
    const request = {
      method: "POST",
      body: JSON.stringify(body),
      session: { user: mockUser },
    } as unknown as ApiRequestWithSession

    await handler(request, response)

    expect(prisma.workflow.create).toBeCalledWith({
      data: expect.objectContaining({
        assignedTo: mockUser.email,
      }),
    })
  })

  it("creates a new workflow with it team assigned to the current user's team", async () => {
    const request = {
      method: "POST",
      body: JSON.stringify(body),
      session: { user: mockUser },
    } as unknown as ApiRequestWithSession

    await handler(request, response)

    expect(prisma.workflow.create).toBeCalledWith({
      data: expect.objectContaining({
        teamAssignedTo: mockUser.team,
      }),
    })
  })

  it("returns 200 with the created workflow", async () => {
    const request = {
      method: "POST",
      body: JSON.stringify(body),
      session: { user: mockUser },
    } as unknown as ApiRequestWithSession

    await handler(request, response)

    expect(response.status).toBeCalledWith(201)
    expect(response.json).toBeCalledWith(mockWorkflow)
  })

  it("returns a not found error when the resident id does not exist", async () => {
    (getResidentById as jest.Mock).mockResolvedValue(null)

    const request = {
      method: "POST",
      body: JSON.stringify(body),
      session: { user: mockUser },
    } as unknown as ApiRequestWithSession

    await handler(request, response)

    expect(response.status).toBeCalledWith(404)
    expect(response.status).not.toBeCalledWith(201)
    expect(response.json).toBeCalledWith({error: "Resident does not exist."})
  })
})

describe("when invalid HTTP methods", () => {
  ;["GET", "PUT", "PATCH", "DELETE"].forEach(method => {
    const response = {
      status: jest.fn().mockImplementation(() => response),
      json: jest.fn(),
    } as unknown as NextApiResponse

    it(`returns 405 for ${method}`, async () => {
      const request = { method: method } as unknown as ApiRequestWithSession

      await handler(request, response)

      expect(response.status).toHaveBeenCalledWith(405)
      expect(response.json).toHaveBeenCalledWith({
        error: "Method not supported on this endpoint",
      })
    })
  })
})
