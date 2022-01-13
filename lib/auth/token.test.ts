import {describe, test} from '@jest/globals';
import {decodeToken, TokenExpired, TokenNotVerified} from "./token";
import {makeToken} from './test-functions';

describe('decoding an auth token', () => {
  describe('a valid token', () => {
    const issuedAt = new Date();
    issuedAt.setMilliseconds(0);
    const validToken = makeToken({iat: issuedAt});
    let decodedToken;

    beforeAll(() => decodedToken = decodeToken(validToken));

    test('correct name is decoded', () => {
      expect(decodedToken).toHaveProperty('name', 'example user');
    });
    test('correct email is decoded', () => {
      expect(decodedToken).toHaveProperty('email', 'test@example.com');
    });
    test('correct issuer is decoded', () => {
      expect(decodedToken).toHaveProperty('issuer', 'Hackney');
    });
    test('correct subject is decoded', () => {
      expect(decodedToken).toHaveProperty('subject', '49516349857314');
    });
    test('correct issued at is decoded', () => {
      expect(decodedToken).toHaveProperty('issuedAt', issuedAt);
    });
    test('correct groups are decoded', () => {
      expect(decodedToken).toHaveProperty('groups', ['test-group']);
    });

    describe('with upper case letters in the email address', () => {
      let decodedToken;

      beforeAll(() => decodedToken = decodeToken(makeToken({email: 'TestCapitals@example.com'})));

      test('email is decoded as lower case', () => {
        expect(decodedToken).toHaveProperty('email', 'testcapitals@example.com');
      });
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
      ).toThrow(TokenNotVerified);
    });
  });
});
