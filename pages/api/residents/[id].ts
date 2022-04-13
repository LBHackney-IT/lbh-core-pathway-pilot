import { NextApiRequest, NextApiResponse } from "next"
import { apiHandler } from "../../../lib/apiHelpers"
import { getFullResidentById, getResidentById } from "../../../lib/residents"
import { middleware as csrfMiddleware } from '../../../lib/csrfToken';

export const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  const { id, fullView, workflowId } = req.query
  const resident =  fullView === "true" ? await getFullResidentById(id as string, workflowId as string) : await getResidentById(id as string)
  res.json(resident)
}

export default apiHandler(csrfMiddleware(handler))
