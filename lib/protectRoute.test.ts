import {protectRoute} from "./protectRoute";
import {GetServerSidePropsContext} from "next";
import {getSession} from "next-auth/client";
import {mockUser} from "../fixtures/users";

const mockGetServerSideProps = jest.fn();

jest.mock("next-auth/client")

beforeEach(() => mockGetServerSideProps.mockClear());

describe('a protected route', () => {
  const protectedRoute = protectRoute(mockGetServerSideProps);

  describe('when not authenticated', () => {
    it('does not call getServerSideProps', async () => {
      ;(getSession as jest.Mock).mockResolvedValue(null)
      await protectedRoute({resolvedUrl: '/'} as GetServerSidePropsContext);

      expect(mockGetServerSideProps).not.toHaveBeenCalled();
    })

    describe('when page is whitelisted', function () {
      it('does call getServerSideProps', async () => {
        ;(getSession as jest.Mock).mockResolvedValue(null)
        await protectedRoute({resolvedUrl: '/sign-in'} as GetServerSidePropsContext);

        expect(mockGetServerSideProps).toHaveBeenCalled();
      })
    });
  });

  describe('when authenticated', () => {
    it('does call getServerSideProps', async () => {
      ;(getSession as jest.Mock).mockResolvedValue({user: mockUser})
      await protectedRoute({resolvedUrl: '/'} as GetServerSidePropsContext);

      expect(mockGetServerSideProps).toHaveBeenCalled();
    })
  });
});
