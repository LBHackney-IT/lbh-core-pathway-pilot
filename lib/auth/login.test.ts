import {describe, test} from '@jest/globals';
import {makeToken} from "./test-functions";
import {login} from "./login";
import {mockUser} from "../../fixtures/users";
import {getUserByEmail} from "./user";
import {decodeToken} from "./token";

jest.mock('./user', () => ({
  getUserByEmail: jest.fn(),
}));

jest.mock('./token', () => ({
  decodeToken: jest.fn(),
}));

describe('a user that exists', () => {
  describe('and is already logged in', () => {
    let user;
    beforeAll(async () => {
      const request = {cookies: {hackneyToken: makeToken({email: mockUser.email})}};
      (getUserByEmail as jest.Mock).mockResolvedValue(mockUser);
      (decodeToken as jest.Mock).mockResolvedValue({
        email: mockUser.email,
      });
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
  });
});
