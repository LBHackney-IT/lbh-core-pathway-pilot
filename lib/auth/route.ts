import {getSession, UserNotInGroup} from "./session";
import {setUser} from "@sentry/nextjs";
import {GetServerSidePropsContext, NextApiRequest} from "next";
import {UserSession} from "./types";

const userInRequiredGroups = (user: UserSession, groups: Array<string>) =>
  groups.every(group => user.groups.includes(group));

const methodWhitelisted = (method: string, whitelist: Array<string>) =>
  whitelist.includes(method);

export const gate = async (
  req: GetServerSidePropsContext['req'] | NextApiRequest,
  requiredGroups: Array<string> = [],
  whitelistMethods: Array<string> = ['GET'],
): Promise<void> => {
  const method = req.method;

  const user = await getSession(req);

  if (req) req["user"] = user;

  setUser({email: user.email});

  if (
    !userInRequiredGroups(user, requiredGroups) &&
    !methodWhitelisted(method, whitelistMethods)
  ) {
    throw new UserNotInGroup();
  }
}
