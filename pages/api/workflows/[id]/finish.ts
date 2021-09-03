import { NextApiResponse } from "next"
import { apiHandler, ApiRequestWithSession } from "../../../../lib/apiHelpers"
import { notifyApprover } from "../../../../lib/notify"
import prisma from "../../../../lib/prisma"
import { finishSchema } from "../../../../lib/validators"

const handler = async (req: ApiRequestWithSession, res: NextApiResponse) => {
  const { id } = req.query

  const values = JSON.parse(req.body)
  finishSchema.validate(values)

  const workflow = await prisma.workflow.update({
    where: {
      id: id as string,
    },
    data: {
      submittedAt: new Date(),
      submittedBy: req.session.user.email,
      reviewBefore: values.reviewBefore || null,
      assignedTo: values.approverEmail,
      nextSteps: {
        createMany: {
          data: values.nextSteps.map(nextStep => ({
            nextStepOptionId: nextStep.nextStepOptionId[0],
            altSocialCareId: nextStep.altSocialCareId,
            note: nextStep.note,
          })),
        },
      },
    },
    include: {
      creator: true,
    },
  })
  await notifyApprover(workflow, values.approverEmail, process.env.NEXTAUTH_URL)
  res.json(workflow)
}

export default apiHandler(handler)
