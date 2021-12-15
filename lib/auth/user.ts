import {User} from "@prisma/client";
import prisma from "../prisma";
import {decodeToken} from "./token";

export const getUserByToken = async (token: string): Promise<User> => {
  const {email} = decodeToken(token);
  return await getUserByEmail(email);
};

export const getUserByEmail = (email: string): Promise<User> =>
  prisma.user.findUnique({where: {email}});

export interface CreateUserInput {
  name: string;
  email: string;
  lastSeenAt: Date;
}

export const createUser = (data: CreateUserInput): Promise<User> =>
  prisma.user.create({data});

export const updateLastSeenAt = (email: string): Promise<User> =>
  prisma.user.update({
    where: {email},
    data: {
      lastSeenAt: new Date(),
    },
  })

export const unmarkUserAsHistoric = (email: string): Promise<User> =>
  prisma.user.update({
    where: {email},
    data: {historic: false},
  });
