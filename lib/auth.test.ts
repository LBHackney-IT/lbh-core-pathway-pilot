import {describe, test} from '@jest/globals';
import {decodeToken, TokenExpired, TokenVerifyFailed} from "./auth";
import {sign} from "jsonwebtoken";

const currentToken = process.env.HACKNEY_JWT_SECRET
beforeAll(() => process.env.HACKNEY_JWT_SECRET = 'test-secret');
afterAll(() => process.env.HACKNEY_JWT_SECRET = currentToken);

const makeToken = (
  {
    sub = '49516349857314',
    email = 'test@example.com',
    iss = 'Hackney',
    name = 'example user',
    groups = ['test-group'],
    iat = new Date(),
  }
) => sign(
  {sub, email, iss, name, groups, iat: Math.floor(iat.getTime() / 1000)},
  process.env.HACKNEY_JWT_SECRET,
);

describe('decoding an auth token', () => {
  describe('a valid token', () => {
    const validToken = makeToken({});
    let decodedToken;

    beforeAll(() => decodedToken = decodeToken(validToken));

    test('correct name is decoded', () => {
      expect(decodedToken).toHaveProperty('name', 'example user');
    });
    test('correct email is decoded', () => {
      expect(decodedToken).toHaveProperty('email', 'test@example.com');
    });
  });

  describe('an expired token', () => {
    const expiredToken = makeToken({iat: new Date(2010, 0, 1)})

    test('throws an exception stating it is expired', () => {
      expect(() => decodeToken(expiredToken)).toThrow(TokenExpired);
    });
  });

  describe('an invalid token', () => {
    test('throws an exception when verifying', () => {
      expect(() =>
        decodeToken('ogreij-0589yhbq3 o58t7h3q4nvt0834jtvh9h3 4v4')
      ).toThrow(TokenVerifyFailed);
    });
  });
});
