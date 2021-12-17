import {NextApiRequest, NextApiResponse} from "next"
import { apiHandler } from "../../../lib/apiHelpers"
import prisma from "../../../lib/prisma"
import { EditableUserValues } from "../../../types"
import { middleware as csrfMiddleware } from "../../../lib/csrfToken"

export const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  switch (req.method) {
    case "PATCH": {
      if (!req['user']?.approver)
        return res
          .status(400)
          .json({ error: "You're not authorised to perform that action" })

      const values: EditableUserValues = JSON.parse(req.body)

      const changed = Object.entries(values)

      const updates = await Promise.all(
        changed.map(
          async ([id, data]) =>
            await prisma.user.update({
              where: {
                id,
              },
              data: {
                ...data,
                team: data?.team || null,
              },
            })
        )
      )

      res.json(updates)
      break
    }

    case "GET": {
      const users = await prisma.user.findMany({
        where: {
          historic: req.query?.historic ? undefined : false,
        },
        orderBy: {
          name: "asc",
        },
      })
      res.json(users)
      break
    }

    default: {
      res.status(405).json({ error: "Method not supported on this endpoint" })
    }
  }
}

export default apiHandler(csrfMiddleware(handler))
