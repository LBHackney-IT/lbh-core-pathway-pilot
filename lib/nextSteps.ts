import { Prisma } from "@prisma/client"
import nextStepOptions from "../config/nextSteps/nextStepOptions"
import { notifyNextStep } from "./notify"
import prisma from "./prisma"

const workflowWithRelations = Prisma.validator<Prisma.WorkflowArgs>()({
  include: {
    nextSteps: true,
    creator: true,
  },
})
type WorkflowWithRelations = Prisma.WorkflowGetPayload<
  typeof workflowWithRelations
>

export const triggerNextSteps = async (
  workflow: WorkflowWithRelations
): Promise<void> => {
  workflow.nextSteps
    .map(nextStep => ({
      ...nextStep,
      option: nextStepOptions.find(o => o.id === nextStep.nextStepOptionId),
    }))
    // // only grab up to 10 next steps
    // .slice(0, 10)
    .forEach(async s => {
      // 1. if the step has already been triggered, bail out
      if (s.triggeredAt) {
        console.error(
          `[nextsteps][error] got a next step that was already triggered: ${s.id}`
        )
        return
      }

      // 2. if we need to wait for manager approval and it's not given, bail out
      if (s.option.waitForApproval && !workflow.managerApprovedAt) return

      // 2. if we need to wait for qam authorisation and it's not given, bail out
      if (s.option.waitForQamAuthorisation && !workflow.panelApprovedAt) return

      // 3. send email
      if (s.option.email)
        await notifyNextStep(workflow, s.option.email, process.env.NEXTAUTH_URL)

      // 4. create new workflow
      if (s.option.workflowToStart)
        await prisma.workflow.create({
          data: {
            formId: s.option.workflowToStart,
            socialCareId: s.altSocialCareId || workflow.socialCareId,
            createdBy: workflow.creator.email,
            assignedTo: workflow.creator.email,
            teamAssignedTo: workflow.creator?.team,
          },
        })

      // 5. mark the step as triggered so it isn't fired again
      await prisma.nextStep.update({
        where: { id: s.id },
        data: {
          triggeredAt: new Date(),
        },
      })
    })
}
