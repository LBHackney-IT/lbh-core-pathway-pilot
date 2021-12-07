import {getUserByEmail} from "./user";
import {decodeToken} from "./token";
import {Team} from "@prisma/client";

export interface UserSession {
  name: string;
  email: string;
  approver: boolean;
  panelApprover: boolean;
  team: Team;
}

export const login = async (request: { cookies: {hackneyToken: string}}): Promise<UserSession> => {
  const token = await decodeToken(request?.cookies?.hackneyToken);
  const user = await getUserByEmail(token.email);

  return {
    name: user.name,
    email: user.email,
    approver: user.approver,
    panelApprover: user.panelApprover,
    team: user.team,
  }
};
