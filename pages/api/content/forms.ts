import { NextApiResponse } from "next"
import { apiHandler, ApiRequestWithSession } from "../../../lib/apiHelpers"
import {asyncFormsForThisEnv} from "../../../config/forms";

export const handler = async (req: ApiRequestWithSession, res: NextApiResponse): Promise<void> => {
  switch (req.method) {
    case "GET": {
      res.status(200).json({ forms: await asyncFormsForThisEnv() });
      break;
    }

    default: {
      res.status(405).json({ error: "Method not supported on this endpoint" })
    }
  }
}

export default apiHandler(handler)
