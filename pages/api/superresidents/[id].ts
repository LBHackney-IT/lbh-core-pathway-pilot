import { NextApiRequest, NextApiResponse } from "next"
import { apiHandler } from "../../../lib/apiHelpers"
import { getFullResidentById } from "../../../lib/residents"
import { middleware as csrfMiddleware } from '../../../lib/csrfToken';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query
  const resident = await getFullResidentById(id as string)
  res.json(resident)
}

export default apiHandler(csrfMiddleware(handler))
