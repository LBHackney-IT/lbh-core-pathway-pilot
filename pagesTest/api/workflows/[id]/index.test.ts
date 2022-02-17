import {NextApiResponse} from "next";
import prisma from "../../../../lib/prisma";
import {mockWorkflow} from "../../../../fixtures/workflows";
import {makeNextApiRequest, testApiHandlerUnsupportedMethods} from "../../../../lib/auth/test-functions";
import {handler} from "../../../../pages/api/workflows/[id]";
import {mockSession} from "../../../../fixtures/session";

const mockWorkflowWithAnswers = {
  ...mockWorkflow,
  answers: {
    "Theme": {
      "Question One": "",
      "Question Two": "",
    },
  },
}

jest.mock("../../../../config/answerFilters", () => ([{
  id: "mock-filter",
  label: "Mock Filter",
  answers: { "Theme": ["Question One"] },
}]))
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

;(prisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflowWithAnswers);

describe('pages/api/workflows/[id]', () => {
  testApiHandlerUnsupportedMethods(handler, ["GET", "PATCH", "DELETE"])

  describe('retrieving a workflow', () => {
    beforeAll(async () => {
      ;(response.status as jest.Mock).mockClear()
      ;(response.json as jest.Mock).mockClear()
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
      expect(response.json).toHaveBeenCalledWith({workflow: mockWorkflowWithAnswers})
    })

    describe('with filtering', () => {
      describe('an invalid filter', function () {
        beforeAll(async () => {
          ;(response.status as jest.Mock).mockClear()
          ;(response.json as jest.Mock).mockClear()
          await handler(makeNextApiRequest({
            url: '/api/workflows/mock-workflow',
            query: {id: 'mock-workflow', filter: 'invalid-filter'},
            session: mockSession,
          }), response);
        })

        test('gives a request error status', () => {
          expect(response.status).toHaveBeenCalledWith(400)
        })

        test('returns an error detailing the invalid filter', () => {
          expect(response.json).toHaveBeenCalledWith({
            error: 'invalid-filter is not a valid filter, must be one of mock-filter',
          })
        })
      });

      describe('a known mock filter', () => {
        beforeAll(async () => {
          ;(response.status as jest.Mock).mockClear()
          ;(response.json as jest.Mock).mockClear()
          await handler(makeNextApiRequest({
            url: '/api/workflows/mock-workflow',
            query: {id: 'mock-workflow', filter: 'mock-filter'},
            session: mockSession,
          }), response);
        })

        test('gives a request error status', () => {
          expect(response.status).toHaveBeenCalledWith(200)
        })

        test('returns an error detailing the invalid filter', () => {
          expect(response.json).toHaveBeenCalledWith({
            workflow: {
              ...mockWorkflowWithAnswers,
              answers: {
                "Theme": {
                  "Question One": "",
                },
              },
            },
          })
        })
      });
    });
  });
})
