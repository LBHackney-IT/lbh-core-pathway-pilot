import {NextApiRequest, NextApiResponse} from "next"
import { apiHandler } from "../../../lib/apiHelpers"
import prisma from "../../../lib/prisma"
import { middleware as csrfMiddleware } from '../../../lib/csrfToken';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "PATCH": {
      if (!req['user']?.approver)
        return res
          .status(400)
          .json({ error: "You're not authorised to perform that action" })

      const { id } = req.query
      const { team, approver, panelApprover } = JSON.parse(req.body)

      const user = await prisma.user.update({
        where: {
          id: id as string,
        },
        data: {
          team,
          approver,
          panelApprover,
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
