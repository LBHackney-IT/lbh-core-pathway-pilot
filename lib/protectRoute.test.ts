import {protectRoute} from "./protectRoute";
import {getLoginUrl, getSession} from "./auth/session";
import {UserNotLoggedIn} from "./auth/session";
import {pilotGroup} from "../config/allowedGroups";
import {mockSession, mockSessionNotInPilot} from "../fixtures/session";
import {makeGetServerSidePropsContext} from "./auth/test-functions";

const mockGetServerSideProps = jest.fn();

jest.mock("./auth/session");
;(getLoginUrl as jest.Mock).mockReturnValue("auth-server");

describe('a protected route', () => {
  const protectedRoute = protectRoute(mockGetServerSideProps, [pilotGroup]);

  describe('when not authenticated', () => {
    let response;

    beforeAll(async () => {
      (getSession as jest.Mock).mockRejectedValueOnce(new UserNotLoggedIn);
      response = await protectedRoute(makeGetServerSidePropsContext({}));
    });

    it('does not call getServerSideProps', () => {
      expect(mockGetServerSideProps).not.toHaveBeenCalled();
    })
    it('redirects to the auth server', () => {
      expect(response).toMatchObject(expect.objectContaining({
        redirect: expect.objectContaining({
          destination: "auth-server"
        })
      }))
    })
  });

  describe('when authenticated', () => {
    describe('and in the expected group', () => {
      beforeAll(async () => {
        mockGetServerSideProps.mockClear()
        ;(getSession as jest.Mock).mockResolvedValueOnce(mockSession)
        await protectedRoute(makeGetServerSidePropsContext({}));
      });

      it('does call getServerSideProps', async () => {
        expect(mockGetServerSideProps).toHaveBeenCalled();
      })
    });

    describe('and not in the expected group', () => {
      beforeAll(async () => {
        mockGetServerSideProps.mockClear()
        ;(getSession as jest.Mock).mockResolvedValueOnce(mockSessionNotInPilot);
        await protectedRoute(makeGetServerSidePropsContext({}));
      });

      it('does not call getServerSideProps', async () => {
        expect(mockGetServerSideProps).not.toHaveBeenCalled();
      })
    });
  });
});
