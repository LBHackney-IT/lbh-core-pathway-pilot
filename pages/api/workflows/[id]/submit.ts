import { NextApiResponse } from "next"
import { apiHandler, ApiRequestWithSession } from "../../../../lib/apiHelpers"
import prisma from "../../../../lib/prisma"
import { finishSchema } from "../../../../lib/validators"

const handler = async (req: ApiRequestWithSession, res: NextApiResponse) => {
  const { id } = req.query

  const values = JSON.parse(req.body)
  finishSchema.validate(values)

  // TODO: handle approver notification with notify here
  const workflow = await prisma.workflow.update({
    where: {
      id: id as string,
    },
    data: {
      submittedAt: new Date(),
      submittedBy: req.session.user.email,
      reviewBefore: values.reviewBefore,
      assignedTo: values.approverEmail,
    },
  })
  res.json(workflow)
}

export default apiHandler(handler)
