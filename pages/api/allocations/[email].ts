import {NextApiRequest, NextApiResponse} from "next"
import { apiHandler } from "../../../lib/apiHelpers"
import { middleware as csrfMiddleware } from "../../../lib/csrfToken"
import { getAllocationsByEmail } from "../../../lib/allocations"

export const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  switch (req.method) {
    case "GET": {
      const { email } = req.query

      const allocations = await getAllocationsByEmail(email as string)

      res.json(allocations)

      break
    }

    default: {
      res.status(405).json({ error: "Method not supported on this endpoint" })
    }
  }
}

export default apiHandler(csrfMiddleware(handler))
