import {describe, test} from '@jest/globals';
import {getUserByEmail, getUserByToken} from "./user";
import prisma from "../prisma";
import {mockUser} from "../../fixtures/users";
import {makeToken} from "./test-functions";


jest.mock('../prisma', () => ({
  user: {
    findUnique: jest.fn(),
  },
}));

describe('an existing user', () => {
  beforeAll(() => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
  });

  test('is retrieved by email', async () => {
    expect(await getUserByEmail(mockUser.email)).toMatchObject(mockUser);
  });

  test('is retrieved by token', async () => {
    expect(await getUserByToken(makeToken({email: mockUser.email}))).toMatchObject(mockUser);
  });
});

describe('a non-existent user', () => {
  beforeAll(() => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
  });

  test('is not retrieved by email', async () => {
    expect(await getUserByEmail(mockUser.email)).toBeNull();
  });

  test('is not retrieved by token', async () => {
    expect(await getUserByToken(makeToken({email: mockUser.email}))).toBeNull();
  });
});
