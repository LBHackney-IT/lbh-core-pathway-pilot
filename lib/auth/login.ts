import {getUserByEmail} from "./user";
import {decodeToken} from "./token";
import {Team} from "@prisma/client";
import {pilotGroup} from "../../config/allowedGroups";

export interface UserSession {
  name: string;
  email: string;
  approver: boolean;
  panelApprover: boolean;
  team: Team;
  shortcuts: Array<string>;
  inPilot: boolean;
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
    shortcuts: user.shortcuts,
    inPilot: token.groups.includes(pilotGroup),
  }
};
