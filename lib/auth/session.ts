import {createUser, getUserByEmail, unmarkUserAsHistoric, updateLastSeenAt} from "./user";
import {decodeToken, TokenExpired, TokenNotVerified} from "./token";
import {pilotGroup} from "../../config/allowedGroups";
import {GetServerSidePropsContext, NextApiRequest} from "next";
import {UserSession} from "./types";

export class LoginError extends Error {
}

export class UserNotLoggedIn extends LoginError {
}

export class UserNotInGroup extends LoginError {
}

export const getSession = async (request: GetServerSidePropsContext['req'] | NextApiRequest): Promise<UserSession> => {
  try {
    const tokenString =
      request?.cookies[process.env.HACKNEY_AUTH_COOKIE_NAME];

    const token = decodeToken(tokenString);
    let user = await getUserByEmail(token.email);

    if (!user) {
      user = await createUser({
        name: token.name,
        email: token.email,
        lastSeenAt: new Date(),
      });
    } else {
      await updateLastSeenAt(user.email);
    }

    if (user.historic) await unmarkUserAsHistoric(user.name, user.email);

    return {
      name: user.name,
      email: user.email,
      approver: user.approver,
      panelApprover: user.panelApprover,
      team: user.team,
      groups: token.groups,
      shortcuts: user.shortcuts,
      inPilot: token.groups.includes(pilotGroup),
    };
  } catch (e) {
    switch (e.constructor) {
      case TokenNotVerified:
        throw new UserNotLoggedIn;
      case TokenExpired:
        throw new UserNotLoggedIn;
      default:
        throw e;
    }
  }
};

export const getLoginUrl = (redirect: string = null): string => {
  return `${process.env.HACKNEY_AUTH_SERVER_URL}?redirect_uri=${process.env.APP_URL}${redirect ? (redirect.startsWith('/') ? redirect : `/${redirect})`) : ''}`;
}
