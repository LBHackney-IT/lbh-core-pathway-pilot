import {describe, test} from '@jest/globals';
import {createUser, getUserByEmail, getUserByToken, unmarkUserAsHistoric} from "./user";
import prisma from "../prisma";
import {mockUser} from "../../fixtures/users";
import {makeToken} from "./test-functions";

jest.mock('../prisma', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
}));

describe('getUser', () => {
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
});

describe('createUser', () => {
  const lastSeenAt = new Date;
  beforeAll(async () => {
    await createUser({name: 'test', email: 'test@example.com', lastSeenAt});
  });
  test('calls prisma.create with the correct name', () => {
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({name: 'test'}),
    });
  });
  test('calls prisma.create with the correct email', () => {
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({email: 'test@example.com'}),
    });
  });
  test('calls prisma.create with the correct lastSeenAt', () => {
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({lastSeenAt}),
    });
  });
});

describe('unmarkUserAsHistoric', () => {
  beforeAll(async () => {
    await unmarkUserAsHistoric('test@example.com');
  });
  test('calls prisma.update with the correct email', () => {
    expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
      where: {email: 'test@example.com'},
    }));
  });
  test('calls prisma.update with the correct historic flag', () => {
    expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
      data: {historic: false},
    }));
  });
});
