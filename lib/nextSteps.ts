import {Prisma} from "@prisma/client"
import nextStepOptions from "../config/nextSteps/nextStepOptions"
import {notifyNextStep} from "./notify"
import prisma from "./prisma"

const workflowWithRelations = Prisma.validator<Prisma.WorkflowArgs>()({
  include: {
    nextSteps: true,
    creator: true,
  },
})
type WorkflowWithRelations = Prisma.WorkflowGetPayload<typeof workflowWithRelations>

const triggerNextStep = async (step, workflow) => {
  // 1. if the step has already been triggered, bail out
  if (step.triggeredAt) {
    console.error(
      `[nextsteps][error] got a next step that was already triggered: ${step.id}`
    )
    return;
  }

  // if we can't find a matching option, leave it be
  if (!step.option) {
    console.error(
      `[nextsteps][error] got an orphaned next step without an option: ${step.id}`
    )
    return;
  }

  // 2. if we need to wait for manager approval and it's not given, bail out
  if (step.option.waitForApproval && !workflow.managerApprovedAt) return;

  // 2. if we need to wait for qam authorisation and it's not given, bail out
  if (step.option.waitForQamAuthorisation && !workflow.panelApprovedAt) return;

      // 3. send email
      if (step.option.email)
        await notifyNextStep(workflow, step.option.email, process.env.NEXTAUTH_URL)

    // 4. create new workflow
    if (step.option.workflowToStart)
      await prisma.workflow.create({
        data: {
          formId: step.option.workflowToStart,
          socialCareId: step.altSocialCareId || workflow.socialCareId,
          createdBy: workflow.creator.email,
          assignedTo: workflow.creator.email,
          teamAssignedTo: workflow.creator?.team,
        },
      })

  // 5. mark the step as triggered so it isn't fired again
  await prisma.nextStep.update({
    where: {id: step.id},
    data: {
      triggeredAt: new Date(),
    },
  })
}

export const triggerNextSteps = async (
  workflow: WorkflowWithRelations
): Promise<void> => {
  await Promise.all(
    workflow.nextSteps
      .slice(0, 10)
      .map(nextStep => triggerNextStep({
        ...nextStep,
        option: nextStepOptions.find(o => o.id === nextStep.nextStepOptionId),
      }, workflow))
  );
}
