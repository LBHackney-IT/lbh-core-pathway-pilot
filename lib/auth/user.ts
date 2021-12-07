import {User} from "@prisma/client";
import prisma from "../prisma";
import {decodeToken} from "./token";

export const getUserByToken = async (token: string): Promise<User> => {
  const {email} = decodeToken(token);
  return await getUserByEmail(email);
};

export const getUserByEmail = async (email: string): Promise<User> =>
  await prisma.user.findUnique({where: {email}});
