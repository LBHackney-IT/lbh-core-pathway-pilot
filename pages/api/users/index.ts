import { NextApiResponse } from "next"
import { apiHandler, ApiRequestWithSession } from "../../../lib/apiHelpers"
import prisma from "../../../lib/prisma"

const handler = async (req: ApiRequestWithSession, res: NextApiResponse) => {
  switch (req.method) {
    case "PATCH": {
      if (!req.session.user.approver)
        return res
          .status(400)
          .json({ error: "You're not authorised to perform that action" })

      const users = await prisma.user.updateMany({ data: {}, where: {} })
      res.json(users)
      break
    }

    case "GET": {
      const users = await prisma.user.findMany()
      res.json(users)
      break
    }

    default: {
      res.status(405).json({ error: "Method not supported on this endpoint" })
    }
  }
}

export default apiHandler(handler)
