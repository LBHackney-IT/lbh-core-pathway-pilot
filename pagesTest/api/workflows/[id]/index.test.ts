import {NextApiResponse} from "next";
import prisma from "../../../../lib/prisma";
import {mockWorkflow} from "../../../../fixtures/workflows";
import {makeNextApiRequest, testApiHandlerUnsupportedMethods} from "../../../../lib/auth/test-functions";
import {handler} from "../../../../pages/api/workflows/[id]";
import {mockSession} from "../../../../fixtures/session";

jest.mock("../../../../lib/prisma", () => ({
  nextStep: {
    deleteMany: jest.fn()
  },
  workflow: {
    findUnique: jest.fn(),
  }
}))

const response = {
  status: jest.fn().mockImplementation(() => response),
  json: jest.fn(),
} as unknown as NextApiResponse

;(prisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow);

describe('pages/api/workflows/[id]', () => {
  testApiHandlerUnsupportedMethods(handler, ["GET", "PATCH", "DELETE"])

  describe('retrieving a workflow', () => {
    beforeAll(async () => {
      await handler(makeNextApiRequest({
        url: '/api/workflows/mock-workflow',
        query: { id: 'mock-workflow' },
        session: mockSession,
      }), response);
    })

    test('calls findUnique with the given workflow ID', () => {
      expect(prisma.workflow.findUnique).toHaveBeenCalledWith({
        where: {id: 'mock-workflow'},
      })
    })

    test('gives a success status', () => {
      expect(response.status).toHaveBeenCalledWith(200)
    })

    test('returns the full workflow data', () => {
      expect(response.json).toHaveBeenCalledWith({workflow: mockWorkflow})
    })
  });
})
