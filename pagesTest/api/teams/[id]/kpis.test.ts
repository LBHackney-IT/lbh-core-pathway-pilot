import {beforeAll, beforeEach, describe, test} from "@jest/globals";
import {handler} from "../../../../pages/api/teams/[id]/kpis";
import {NextApiResponse} from "next"
import {makeNextApiRequest, testApiHandlerUnsupportedMethods} from "../../../../lib/auth/test-functions";

let response = {
  status: jest.fn().mockImplementation(() => response),
  json: jest.fn(),
} as unknown as NextApiResponse;

const resetResponse = () => {
  (response.status as jest.Mock).mockClear();
  (response.json as jest.Mock).mockClear();
};

describe("/api/teams/[id]/kpis", () => {
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
