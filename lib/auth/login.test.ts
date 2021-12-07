import {describe, test} from '@jest/globals';
import {login, UserNotLoggedIn} from "./login";
import {mockUser} from "../../fixtures/users";
import {getUserByEmail} from "./user";
import {pilotGroup} from "../../config/allowedGroups";
import {makeToken} from "./test-functions";

jest.mock('./user', () => ({
  getUserByEmail: jest.fn(),
}));

describe('a user that exists in the pilot', () => {
  describe('and is already logged in', () => {
    let user;
    beforeAll(async () => {
      const request = {
        cookies: {
          hackneyToken: makeToken({
            email: mockUser.email,
            groups: [pilotGroup]
          })
        }
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
  describe('and is not logged in', () => {
    const request = {cookies: {}};
    beforeAll(async () => {
      (getUserByEmail as jest.Mock).mockResolvedValue(mockUser);
    });

    test('a UserNotLoggedIn exception is thrown', async () => {
      await expect(async () => await login(request)).rejects.toThrow(UserNotLoggedIn);
    });
  });
});
