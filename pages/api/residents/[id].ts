import { NextApiRequest, NextApiResponse } from "next"
import { apiHandler } from "../../../lib/apiHelpers"
import { getFullResidentById, getResidentById } from "../../../lib/residents"
import { middleware as csrfMiddleware } from '../../../lib/csrfToken';

//add parameter - view = full - then use getFullResidentById
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id, fullView } = req.query
  const resident =  fullView ? await getFullResidentById(id as string) : await getResidentById(id as string)
  res.json(resident)
}

export default apiHandler(csrfMiddleware(handler))
