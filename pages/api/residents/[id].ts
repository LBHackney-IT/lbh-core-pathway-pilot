import { NextApiRequest, NextApiResponse } from "next"
import { apiHandler } from "../../../lib/apiHelpers"
import { getResidentById } from "../../../lib/residents"

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query
  const resident = await getResidentById(id as string)
  res.json(resident)
}

export default apiHandler(handler)
