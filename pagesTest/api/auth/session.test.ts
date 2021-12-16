import {makeNextApiRequest, testApiHandlerUnsupportedMethods} from "../../../lib/auth/test-functions";
import {handler} from "../../../pages/api/auth/session";
import {getSession} from "../../../lib/auth/session";
import {
  mockSession,
  mockSessionApprover,
  mockSessionNotInPilot,
  mockSessionPanelApprover
} from "../../../fixtures/session";
import {NextApiResponse} from "next";


jest.mock("../../../lib/auth/session");
;(getSession as jest.Mock).mockResolvedValue(mockSession);

const response = {
  status: jest.fn().mockImplementation(() => response),
  json: jest.fn(),
} as unknown as NextApiResponse

const resetResponse = () => {
  (response.status as jest.Mock).mockClear();
  (response.json as jest.Mock).mockClear();
};

describe('pages/api/workflows', () => {
  testApiHandlerUnsupportedMethods(handler, ['GET']);

  describe('when logged in as a user outside of the pilot group', () => {
    beforeAll(async () => {
      resetResponse();
      await handler(makeNextApiRequest({
        session: mockSessionNotInPilot,
      }), response);
    });

    test('returns the users session information', () => {
      expect(response.json).toHaveBeenCalledWith({ session: mockSessionNotInPilot });
    })
  });

  describe('when logged in as a user in the pilot group', () => {
    beforeAll(async () => {
      resetResponse();
      await handler(makeNextApiRequest({
        session: mockSession,
      }), response);
    });

    test('returns the users session information', () => {
      expect(response.json).toHaveBeenCalledWith({ session: mockSession });
    })
  });

  describe('when logged in as an approver', () => {
    beforeAll(async () => {
      resetResponse();
      await handler(makeNextApiRequest({
        session: mockSessionApprover,
      }), response);
    });

    test('returns the users session information', () => {
      expect(response.json).toHaveBeenCalledWith({ session: mockSessionApprover });
    })
  });

  describe('when logged in as a panel approver', () => {
    beforeAll(async () => {
      resetResponse();
      await handler(makeNextApiRequest({
        session: mockSessionPanelApprover,
      }), response);
    });

    test('returns the users session information', () => {
      expect(response.json).toHaveBeenCalledWith({ session: mockSessionPanelApprover });
    })
  });

  describe('when not logged in', () => {
    beforeAll(async () => {
      resetResponse();
      await handler(makeNextApiRequest({}), response);
    });

    test('returns the users session information', () => {
      expect(response.json).toHaveBeenCalledWith({ error: "User not logged in" });
    })

    test('returns an unauthorised status code', () => {
      expect(response.status).toHaveBeenCalledWith(401);
    })
  });
});
