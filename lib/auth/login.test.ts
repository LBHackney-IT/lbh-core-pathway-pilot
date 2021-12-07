import {describe, test} from '@jest/globals';
import {login, UserNotLoggedIn, UserSession} from "./login";
import {mockUser} from "../../fixtures/users";
import {createUser, getUserByEmail, unmarkUserAsHistoric} from "./user";
import {pilotGroup} from "../../config/allowedGroups";
import {makeToken} from "./test-functions";

jest.mock('./user', () => ({
  getUserByEmail: jest.fn(),
  createUser: jest.fn(),
  unmarkUserAsHistoric: jest.fn(),
}));

describe('a user that has previously logged into the pilot', () => {
  describe('and is already authenticated', () => {
    let user: UserSession;
    beforeAll(async () => {
      const request = {
        cookies: {
          hackneyToken: makeToken({
            email: mockUser.email,
            groups: [pilotGroup]
          })
        },
      };
      (getUserByEmail as jest.Mock).mockResolvedValue(mockUser);
      user = await login(request);
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
    const request = {cookies: {}};
    beforeAll(async () => {
      (getUserByEmail as jest.Mock).mockResolvedValue(mockUser);
    });

    test('a UserNotLoggedIn exception is thrown', async () => {
      await expect(async () => await login(request)).rejects.toThrow(UserNotLoggedIn);
    });
  });
});

describe('a first time user', () => {
  describe('in the pilot group', () => {
    describe('that is already authenticated', () => {
      let user: UserSession;
      beforeAll(async () => {
        const request = {
          cookies: {
            hackneyToken: makeToken({
              email: 'test@example.com',
              name: 'Test User',
              groups: [pilotGroup],
            })
          }
        };
        (getUserByEmail as jest.Mock).mockResolvedValue(null);
        (createUser as jest.Mock).mockResolvedValue({
          ...mockUser,
          email: 'test@example.com',
          name: 'Test User',
        });
        user = await login(request);
      });

      test('the user is created', () => {
        expect(createUser).toHaveBeenCalledWith({email: 'test@example.com', name: 'Test User'});
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
        let user: UserSession;
        beforeAll(async () => {
          const request = {
            cookies: {
              hackneyToken: makeToken({
                email: 'test@example.com',
                name: 'Test User',
                groups: [pilotGroup],
              }),
            }
          };
          (getUserByEmail as jest.Mock).mockResolvedValue({
            ...mockUser,
            historic: true,
          });
          (unmarkUserAsHistoric as jest.Mock).mockResolvedValue(null);
          user = await login(request);
        });

        test('the user is updated', () => {
          expect(unmarkUserAsHistoric).toHaveBeenCalledWith(mockUser.email);
        });
      });
    });
  });
});
