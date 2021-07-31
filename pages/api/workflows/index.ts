import prisma from "../../../lib/prisma"
import { NextApiRequest, NextApiResponse } from "next"
import { apiHandler } from "../../../lib/apiHelpers"

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "POST":
      const newSubmission = await prisma.workflow.create(req.body)
      res.status(201).json(newSubmission)
      break
    default:
      res.status(405).json({ error: "Method not supported on this endpoint" })
  }
}

export default apiHandler(handler)
