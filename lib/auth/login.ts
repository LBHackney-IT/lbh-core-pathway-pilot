import {getUserByEmail} from "./user";
import {decodeToken} from "./token";

export interface UserSession {
  name: string;
  email: string;
  approver: boolean;
}

export const login = async (request: { cookies: {hackneyToken: string}}): Promise<UserSession> => {
  const token = await decodeToken(request?.cookies?.hackneyToken);
  const user = await getUserByEmail(token.email);

  return {
    name: user.name,
    email: user.email,
    approver: user.approver,
  }
};
