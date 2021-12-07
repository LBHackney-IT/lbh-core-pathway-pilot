import {createUser, getUserByEmail, unmarkUserAsHistoric} from "./user";
import {decodeToken, TokenExpired, TokenNotVerified} from "./token";
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

export class LoginError extends Error {
}

export class UserNotLoggedIn extends LoginError {
}

export const getSession = async (request: { cookies: { hackneyToken?: string } }): Promise<UserSession> => {
  try {
    const token = await decodeToken(request?.cookies?.hackneyToken);
    let user = await getUserByEmail(token.email);

    if (!user) {
      user = await createUser({
        name: token.name,
        email: token.email,
      });
    }

    if (user.historic) {
      await unmarkUserAsHistoric(user.email);
    }

    return {
      name: user.name,
      email: user.email,
      approver: user.approver,
      panelApprover: user.panelApprover,
      team: user.team,
      shortcuts: user.shortcuts,
      inPilot: token.groups.includes(pilotGroup),
    }
  } catch (e) {
    switch (e.constructor) {
      case TokenNotVerified || TokenExpired:
        throw new UserNotLoggedIn;
      default:
        throw e;
    }
  }
};
