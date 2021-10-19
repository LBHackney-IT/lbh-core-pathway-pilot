import { NextApiResponse } from "next"
import { apiHandler, ApiRequestWithSession } from "../../lib/apiHelpers"
import { middleware as csrfMiddleware } from "../../lib/csrfToken"
import prisma from "../../lib/prisma"

const handler = async (req: ApiRequestWithSession, res: NextApiResponse) => {
  switch (req.method) {
    case "PATCH": {
      const user = prisma.user.update({
        where: {
          email: req.session.user.email,
        },
        data: {
          shortcuts: req.body.shortcuts,
        },
      })
      res.json(user)
      break
    }

    default: {
      res.status(405).json({ error: "Method not supported on this endpoint" })
    }
  }
}

export default apiHandler(csrfMiddleware(handler))
