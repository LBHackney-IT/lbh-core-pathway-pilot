import { NextApiResponse } from "next"
import { apiHandler, ApiRequestWithSession } from "../../../../lib/apiHelpers"
import { triggerNextSteps } from "../../../../lib/nextSteps"
import { notifyApprover } from "../../../../lib/notify"
import prisma from "../../../../lib/prisma"

const handler = async (req: ApiRequestWithSession, res: NextApiResponse) => {
  const { id } = req.query

  const values = JSON.parse(req.body)

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
            nextStepOptionId: nextStep.nextStepOptionId,
            altSocialCareId: nextStep.altSocialCareId,
            note: nextStep.note,
          })),
        },
      },
    },
    include: {
      nextSteps: true,
      creator: true,
    },
  })
  await notifyApprover(workflow, values.approverEmail, process.env.NEXTAUTH_URL)
  // await triggerNextSteps(workflow)

  res.json(workflow)
}

export default apiHandler(handler)
