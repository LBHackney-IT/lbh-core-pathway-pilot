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

      const { id } = req.query
      const { team, approver } = JSON.parse(req.body)

      const user = await prisma.user.update({
        where: {
          id: id as string,
        },
        data: {
          team,
          approver,
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

export default apiHandler(handler)
