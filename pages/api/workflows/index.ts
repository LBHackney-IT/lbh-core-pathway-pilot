import prisma from "../../../lib/prisma"
import { NextApiResponse } from "next"
import { apiHandler, ApiRequestWithSession } from "../../../lib/apiHelpers"
import { AssessmentType } from "@prisma/client"
import { assessmentElementsSchema } from "../../../lib/validators"

const handler = async (req: ApiRequestWithSession, res: NextApiResponse) => {
  switch (req.method) {
    case "POST": {
      const data = JSON.parse(req.body)
      assessmentElementsSchema.validate(data)
      const newSubmission = await prisma.workflow.create({
        data: {
          ...data,
          type: AssessmentType.Full,
          createdBy: req.session.user.email,
        },
      })
      res.status(201).json(newSubmission)
      break
    }
    default: {
      res.status(405).json({ error: "Method not supported on this endpoint" })
    }
  }
}

export default apiHandler(handler)
