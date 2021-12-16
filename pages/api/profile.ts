import {NextApiRequest, NextApiResponse} from "next"
import { apiHandler } from "../../lib/apiHelpers"
import { middleware as csrfMiddleware } from "../../lib/csrfToken"
import prisma from "../../lib/prisma"
import { profileSchema } from "../../lib/validators"

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "PATCH": {
      const data = JSON.parse(req.body)

      await profileSchema.validate(data)

      const user = await prisma.user.update({
        where: {
          email: req['user']?.email,
        },
        data: {
          shortcuts: data.shortcuts,
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
