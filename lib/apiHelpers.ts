import {getSession} from "next-auth/client"
import {NextApiRequest, NextApiResponse} from "next"
import {Session} from "next-auth"
import {isInPilotGroup} from "./googleGroups"
import {setUser, withSentry} from "@sentry/nextjs";

export interface ApiRequestWithSession extends NextApiRequest {
  session: Session
}

/** Gracefully handle 401 and 403 errors, let 500s get caught by sentry */
export const apiHandler =
  (handler: (req: ApiRequestWithSession, res: NextApiResponse) => void) =>
    async (req: ApiRequestWithSession, res: NextApiResponse): Promise<void> => {
      const session = await getSession({req})

      if (session) {
        setUser({email: session.user.email});

        const userIsInPilotGroup = await isInPilotGroup(req.headers.cookie)

        if (userIsInPilotGroup || req.method === "GET") {
          req.session = session
          await withSentry(handler)(req, res)
        } else {
          res.status(403).json({
            error: "Not authorised. You are logged in, but not allowed to perform this operation.",
          })
        }
      } else {
        res.status(401).json({
          error: "Not authenticated",
        })
      }
    };
