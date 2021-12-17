import {NextApiRequest, NextApiResponse} from "next"
import {withSentry} from "@sentry/nextjs";
import {gate} from "./auth/route";
import { UserNotLoggedIn, UserNotInGroup } from "./auth/session";

export const apiHandler =
  (handler: (req: NextApiRequest, res: NextApiResponse) => void, requiredGroups: Array<string> = [], allowedMethods: Array<string> = ['GET']) =>
    async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
      try {
        await gate(req, requiredGroups, allowedMethods);

      } catch (e) {
        switch (e.constructor) {
          case UserNotInGroup:
            return res.status(403).json({
              error: "Not authorised. You are logged in, but not allowed to perform this operation.",
            });
          case UserNotLoggedIn:
            return res.status(401).json({
              error: "Not authenticated",
            });
          default:
            throw e;
        }
      }

      await withSentry(handler)(req, res)
    };
