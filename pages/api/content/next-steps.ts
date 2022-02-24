import { NextApiRequest, NextApiResponse } from "next"
import nextStepOptionsForThisEnv from "../../../config/nextSteps/nextStepOptions"
import { apiHandler } from "../../../lib/apiHelpers"
import { middleware as csrfMiddleware } from "../../../lib/csrfToken"

export const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  switch (req.method) {
    case "GET": {
      res.status(200).json({ options: await nextStepOptionsForThisEnv() })
      break
    }

    default: {
      res.status(405).json({ error: "Method not supported on this endpoint" })
    }
  }
}

export default apiHandler(csrfMiddleware(handler))
