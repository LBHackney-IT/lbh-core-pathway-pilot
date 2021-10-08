import { getSession } from "next-auth/client"
import { NextApiRequest, NextApiResponse } from "next"
import { Session } from "next-auth"
import { isInPilotGroup } from "./googleGroups"

export interface ApiRequestWithSession extends NextApiRequest {
  session: Session
}

/** Gracefully handle 401 and catch 500 errors */
export const apiHandler =
  (handler: (req: ApiRequestWithSession, res: NextApiResponse) => void) =>
  async (req: ApiRequestWithSession, res: NextApiResponse): Promise<void> => {
    try {
      const session = await getSession({ req })

      if (session) {
        const userIsInPilotGroup = await isInPilotGroup(req.headers.cookie)

        if (userIsInPilotGroup || req.method === "GET") {
          req.session = session
          return await handler(req, res)
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
    } catch (error) {
      // useful for debugging notify client
      // console.log(error.response.data.errors)
      res.status(error?.response?.status || 500).json({
        error: error.toString(),
      })
    }
  }
