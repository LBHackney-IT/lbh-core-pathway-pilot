import { getSession } from "next-auth/client"
import { NextApiRequest, NextApiResponse } from "next"
import { Session } from "next-auth"

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
        req.session = session
        return await handler(req, res)
      } else {
        res.status(401).json({
          error: "Not authenticated",
        })
      }
    } catch (error) {
      res.status(500).json({
        error: error.toString(),
      })
    }
  }
