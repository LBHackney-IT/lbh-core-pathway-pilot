import {beforeAll, expect, describe, test} from "@jest/globals";
import {handler} from "../../../../pages/api/teams/[id]/kpis";
import {NextApiResponse} from "next"
import {makeNextApiRequest, testApiHandlerUnsupportedMethods} from "../../../../lib/auth/test-functions";
import {DateTime, Duration} from "luxon"
import prisma from "../../../../lib/prisma"

const NOW = "2022-01-18T10:30:00.000Z";
const THIRTY_DAYS_AGO = "2021-12-19T10:30:00.000Z";
const SIXTY_DAYS_AGO = "2021-11-19T10:30:00.000Z"

const response = {
  status: jest.fn().mockImplementation(() => response),
  json: jest.fn(),
} as unknown as NextApiResponse;

const resetResponse = () => {
  (response.status as jest.Mock).mockClear();
  (response.json as jest.Mock).mockClear();
};

jest.mock('luxon');
(DateTime.now as jest.Mock).mockImplementation(() => {
  const {DateTime} = jest.requireActual('luxon');

  return DateTime.fromISO(NOW, {zone: 'utc'});
});
(Duration.fromObject as jest.Mock).mockImplementation((opts) => {
  const {Duration} = jest.requireActual('luxon');

  return Duration.fromObject(opts);
});

jest.mock('../../../../lib/prisma', () => ({
  workflow: {count: jest.fn()},
  $queryRaw: jest.fn(),
}));

(prisma.workflow.count as jest.Mock).mockImplementation(async (query) => {
  // handle started
  if (query.where?.createdAt?.lte) return 10;
  if (query.where?.createdAt?.gte) return 5;

  // handle submitted
  if (query.where?.submittedAt?.lte) return 6;
  if (query.where?.submittedAt?.gte) return 3;

  // handle approved
  if (query.where?.OR[0]?.panelApprovedAt?.lte) return 4;
  if (query.where?.OR[0]?.panelApprovedAt?.gte) return 2;
});

(prisma.$queryRaw as jest.Mock).mockResolvedValue([{
  meanTimeToApproval: "3.561",
}]);

describe("/api/teams/[id]/kpis", () => {
  describe('when a team does exist', () => {
    beforeAll(async () => {
      resetResponse();
      await handler(makeNextApiRequest({query: {id: 'access'}}), response);
    });

    test('checks for workflows started in the last thirty days', () => {
      expect(prisma.workflow.count).toHaveBeenCalledWith({
        where: {
          teamAssignedTo: 'Access',
          createdAt: {
            gte: THIRTY_DAYS_AGO,
          },
        },
      });
    });

    test('checks for workflows submitted in the last thirty days', () => {
      expect(prisma.workflow.count).toHaveBeenCalledWith({
        where: {
          teamAssignedTo: 'Access',
          submittedAt: {
            gte: THIRTY_DAYS_AGO,
          },
        },
      });
    });

    test('checks for workflows manager or panel approved in the last thirty days', () => {
      expect(prisma.workflow.count).toHaveBeenCalledWith({
        where: {
          teamAssignedTo: 'Access',
          OR: [
            {
              panelApprovedAt: {
                gte: THIRTY_DAYS_AGO,
              },
            },
            {
              managerApprovedAt: {
                gte: THIRTY_DAYS_AGO,
              },
              needsPanelApproval: false,
            },
          ],
        },
      });
    });

    test('queries for mean time to manager or panel approve', () => {
      expect(prisma.$queryRaw).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.stringContaining(`SELECT TO_CHAR(AVG("managerApprovedAt" - "createdAt"), 'DD') AS "meanTimeToApproval"`),
          expect.stringContaining(`FROM "Workflow"`),
          expect.stringContaining(`WHERE "managerApprovedAt" IS NOT null`),
          expect.stringContaining(`AND "teamAssignedTo" = `),
        ]),
        "Access"
      );
    });

    test('checks for workflows started between sixty and thirty days ago', () => {
      expect(prisma.workflow.count).toHaveBeenCalledWith({
        where: {
          teamAssignedTo: 'Access',
          createdAt: {
            gte: SIXTY_DAYS_AGO,
            lte: THIRTY_DAYS_AGO,
          },
        },
      });
    });

    test('checks for workflows submitted between sixty and thirty days ago', () => {
      expect(prisma.workflow.count).toHaveBeenCalledWith({
        where: {
          teamAssignedTo: 'Access',
          submittedAt: {
            gte: SIXTY_DAYS_AGO,
            lte: THIRTY_DAYS_AGO,
          },
        },
      });
    });

    test('checks for workflows manager or panel approved between sixty and thirty days ago', () => {
      expect(prisma.workflow.count).toHaveBeenCalledWith({
        where: {
          teamAssignedTo: 'Access',
          OR: [
            {
              panelApprovedAt: {
                gte: SIXTY_DAYS_AGO,
                lte: THIRTY_DAYS_AGO,
              },
            },
            {
              managerApprovedAt: {
                gte: SIXTY_DAYS_AGO,
                lte: THIRTY_DAYS_AGO,
              },
              needsPanelApproval: false,
            },
          ],
        },
      });
    });

    test('responds with a 200', () => {
      expect(response.status).toHaveBeenCalledWith(200);
    });

    test('responds with the stats for the team', () => {
      expect(response.json).toHaveBeenCalledWith({
        last30Days: {
          completed: 2,
          started: 5,
          submitted: 3,
          turnaroundTime: 3,
        },
        prev30Days: {
          completed: 4,
          started: 10,
          submitted: 6,
        },
      });
    });
  });

  describe('when a team does not exist', () => {
    beforeAll(async () => {
      resetResponse();
      await handler(makeNextApiRequest({query: {id: 'unknown-team'}}), response);
    });

    test('responds with a 404', () => {
      expect(response.status).toHaveBeenCalledWith(404);
    });

    test('responds with an error message', () => {
      expect(response.json).toHaveBeenCalledWith({
        error: 'That team does not exist',
      });
    });
  });

  testApiHandlerUnsupportedMethods(handler, ['GET']);
});
