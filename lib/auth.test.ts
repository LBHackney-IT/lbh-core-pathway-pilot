import {describe, test} from '@jest/globals';
import {decodeToken, TokenVerifyFailed} from "./auth";

const currentToken = process.env.HACKNEY_JWT_SECRET
beforeAll(() => process.env.HACKNEY_JWT_SECRET = 'test-secret');
afterAll(() => process.env.HACKNEY_JWT_SECRET = currentToken);

describe('decoding an auth token', () => {
  describe('an invalid token', () => {
    test('throws an exception when verifying', () => {
      const token = 'ogreij-0589yhbq3 o58t7h3q4nvt0834jtvh9h3 4v4';
      expect(() => decodeToken(token)).toThrow(TokenVerifyFailed);
    });
  });
});
