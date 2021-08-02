import { NextApiRequest, NextApiResponse } from "next"
import { apiHandler } from "../../../lib/apiHelpers"
import prisma from "../../../lib/prisma"

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const users = await prisma.user.findMany()
  res.json(users)
}

export default apiHandler(handler)
