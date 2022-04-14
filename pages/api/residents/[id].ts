import { NextApiRequest, NextApiResponse } from "next"
import { apiHandler } from "../../../lib/apiHelpers"
import { getFullResidentById, getResidentById } from "../../../lib/residents"
import { middleware as csrfMiddleware } from '../../../lib/csrfToken';

export const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  const { id, view, workflowId } = req.query

  switch (view) {
    case 'full':
      res.json(await getFullResidentById(id as string, workflowId as string))
      break
    default:
      res.json(await getResidentById(id as string))
  }
}

export default apiHandler(csrfMiddleware(handler))
