import {describe, test} from '@jest/globals';
import {makeGetServerSidePropsContext, makeToken} from "./test-functions";
import {gate} from "./route";
import {UserNotInGroup, UserNotLoggedIn} from "./session";
import {getUserByEmail} from "./user";
import {mockUser} from "../../fixtures/users";
import {pilotGroup} from "../../config/allowedGroups";

jest.mock('./user', () => ({
  getUserByEmail: jest.fn(),
  createUser: jest.fn(),
  unmarkUserAsHistoric: jest.fn(),
  updateLastSeenAt: jest.fn(),
}));

(getUserByEmail as jest.Mock).mockResolvedValue(mockUser);

describe('gate', () => {
  describe('an unauthenticated user', () => {
    test('getServerSideProps', async () => {
      await expect(
        gate(
          makeGetServerSidePropsContext({
            token: null,
          }).req,
        )
      ).rejects.toThrow(UserNotLoggedIn);
    });
  });

  describe('an authenticated user', () => {
    describe('in the expected group', () => {
      test('getServerSideProps', async () => {
        await expect(
          gate(
            makeGetServerSidePropsContext({
              token: makeToken({groups: [pilotGroup]}),
            }).req,
            [pilotGroup],
          )
        ).resolves.toBe(undefined);
      });
    });

    describe('not in the expected group', () => {
      test('getServerSideProps', async () => {
        await expect(
          gate(
            makeGetServerSidePropsContext({
              token: makeToken({
                groups: [],
              }),
            }).req,
            ['required-group'],
            [],
          )
        ).rejects.toThrow(UserNotInGroup);
      });
    });
  });
});
