import {describe, test} from '@jest/globals';
import {getLoginUrl, getSession, UserNotLoggedIn} from "./session";
import {mockUser} from "../../fixtures/users";
import {createUser, getUserByEmail, unmarkUserAsHistoric} from "./user";
import {pilotGroup} from "../../config/allowedGroups";
import {makeGetServerSidePropsContext, makeToken} from "./test-functions";
import {UserSession} from "./types";

jest.mock('./user', () => ({
  getUserByEmail: jest.fn(),
  createUser: jest.fn(),
  unmarkUserAsHistoric: jest.fn(),
  updateLastSeenAt: jest.fn(),
}));

describe('getSession', () => {
  describe('a user that has previously logged into the pilot', () => {
    describe('and is already authenticated', () => {
      let user: UserSession;
      beforeAll(async () => {
        const request = makeGetServerSidePropsContext({
          token: makeToken({groups: [pilotGroup]}),
        }).req;
        (getUserByEmail as jest.Mock).mockResolvedValue(mockUser);
        user = await getSession(request);
      });

      test('the user name is retrieved', () => {
        expect(user).toHaveProperty('name', mockUser.name);
      });

      test('the user email is retrieved', () => {
        expect(user).toHaveProperty('email', mockUser.email);
      });

      test('the user approver status is retrieved', () => {
        expect(user).toHaveProperty('approver', mockUser.approver);
      });

      test('the user panel approver status is retrieved', () => {
        expect(user).toHaveProperty('panelApprover', mockUser.panelApprover);
      });

      test('the user\'s team is retrieved', () => {
        expect(user).toHaveProperty('team', mockUser.team);
      });

      test('the user\'s shortcuts are retrieved', () => {
        expect(user).toHaveProperty('shortcuts', mockUser.shortcuts);
      });

      test('the user\'s pilot inclusion status is retrieved', () => {
        expect(user).toHaveProperty('inPilot', true);
      });
    });
    describe('and is not authenticated', () => {
      beforeAll(async () => {
        (getUserByEmail as jest.Mock).mockResolvedValue(mockUser);
      });

      test('a UserNotLoggedIn exception is thrown', async () => {
        await expect(async () => await getSession(makeGetServerSidePropsContext({
          token: null,
        }).req)).rejects.toThrow(UserNotLoggedIn);
      });
    });
  });

  describe('a first time user', () => {
    describe('in the pilot group', () => {
      describe('that is already authenticated', () => {
        let user: UserSession;
        beforeAll(async () => {
          (getUserByEmail as jest.Mock).mockResolvedValue(null);
          (createUser as jest.Mock).mockResolvedValue({
            ...mockUser,
            email: 'test@example.com',
            name: 'Test User',
          });
          user = await getSession(makeGetServerSidePropsContext({
            token: makeToken({
              email: 'test@example.com',
              name: 'Test User',
              groups: [pilotGroup],
            }),
          }).req);
        });

        test('the user is created', () => {
          expect(createUser).toHaveBeenCalledWith({
            email: 'test@example.com',
            name: 'Test User',
            lastSeenAt: expect.any(Date),
          });
        });

        test('the correct user session is returned', () => {
          expect(user).toMatchObject({
            name: 'Test User',
            email: 'test@example.com',
            approver: mockUser.approver,
            panelApprover: mockUser.panelApprover,
            team: mockUser.team,
            shortcuts: mockUser.shortcuts,
            inPilot: true,
          })
        });

        describe('and was a historic user', () => {
          beforeAll(async () => {
            (getUserByEmail as jest.Mock).mockResolvedValue({
              ...mockUser,
              historic: true,
            });
            (unmarkUserAsHistoric as jest.Mock).mockResolvedValue(null);
            await getSession(makeGetServerSidePropsContext({
              token: makeToken({
                email: 'test@example.com',
                name: 'Test User',
                groups: [pilotGroup],
              }),
            }).req);
          });

          test('the user is updated', () => {
            expect(unmarkUserAsHistoric).toHaveBeenCalledWith(mockUser.email);
          });
        });
      });
    });
  });
});

describe('getLoginUrl', () => {
  let authUrl: string;
  const currentAuthUrl = process.env.HACKNEY_AUTH_SERVER_URL;
  const currentAppUrl = process.env.APP_URL;
  afterAll(() => {
    process.env.HACKNEY_AUTH_SERVER_URL = currentAuthUrl;
    process.env.APP_URL = currentAppUrl;
  });
  beforeAll(() => {
    process.env.HACKNEY_AUTH_SERVER_URL = 'https://auth-server/auth';
    process.env.APP_URL = 'https://our-service/';
    authUrl = getLoginUrl('/requested-page');
  });

  test('includes the correct auth server', () => {
    expect(authUrl).toMatch('auth-server');
  });

  test('uses https', () => {
    expect(authUrl).toMatch('https://');
  });

  test('provides the expected redirect back to our app', () => {
    expect(authUrl).toMatch('?redirect_uri=https://our-service');
  });

  test('provides the expected redirect back to the given page', () => {
    expect(authUrl).toMatch('/requested-page');
  });
});
