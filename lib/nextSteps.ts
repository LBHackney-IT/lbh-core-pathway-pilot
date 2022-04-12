import { Prisma, NextStep } from "@prisma/client"
import nextStepOptionsForThisEnv from "../config/nextSteps/nextStepOptions"
import {Form, NextStepOption} from "../types"
import { notifyNextStep } from "./notify"
import prisma from "./prisma"
import {getResidentById} from "./residents"
import fetch from "node-fetch";
import formsForThisEnv from "../config/forms";

const workflowWithRelations = Prisma.validator<Prisma.WorkflowArgs>()({
  include: {
    nextSteps: true,
    creator: true,
  },
})

type WorkflowWithRelations = Prisma.WorkflowGetPayload<
  typeof workflowWithRelations
>

type NextStepWithOption = NextStep & { option: NextStepOption }

const triggerNextStep = async (
  step: NextStepWithOption,
  workflow: WorkflowWithRelations & { form: Form },
  sessionCookie: string,
) => {
  // 1. if the step has already been triggered, bail out
  if (step.triggeredAt) {
    console.error(
      `[nextsteps][error] got a next step that was already triggered: ${step.id}`
    )
    return
  }

  // if we can't find a matching option, leave it be
  if (!step.option) {
    console.error(
      `[nextsteps][error] got an orphaned next step without an option: ${step.id}`
    )
    return
  }

  // 2. if we need to wait for manager approval and it's not given, bail out
  if (step.option.waitForApproval && !workflow.managerApprovedAt) {
    console.error(`[nextsteps][error] step needs manager approval: ${step.id}`)
    return
  }

  // 2. if we need to wait for qam authorisation and it's not given, bail out
  if (step.option.waitForQamApproval && !workflow.panelApprovedAt) {
    console.error(`[nextsteps][error] step needs qam authorisation: ${step.id}`)
    return
  }

  // 3. send email
  if (step.option.email)
    try {
      await notifyNextStep(
        workflow,
        step.option.email,
        process.env.APP_URL,
        step.note,
        step.option.title
      )
    } catch (e) {
      console.error(
        `[nextsteps][error] error sending notification for step: ${
          step.id
        } (${e.toString()})`
      )
      return
    }

  // 4. create new workflow
  if (step.option.workflowToStart)
    try {
      await prisma.workflow.create({
        data: {
          formId: step.option.workflowToStart,
          socialCareId: step.altSocialCareId || workflow.socialCareId,
          createdBy: workflow.creator.email,
          assignedTo: workflow.creator.email,
          teamAssignedTo: workflow.creator?.team,
          workflowId: workflow.id, // always link new workflows to their parent
        },
      })
    } catch (e) {
      console.error(
        `[nextsteps][error] error creating new workflow for step: ${
          step.id
        } (${e.toString()})`
      )
      return
    }

  if (step.option.webhook?.[process.env.ENVIRONMENT]) {
    try {
      const resident = await getResidentById(workflow.socialCareId);

      await Promise.all(
        step.option.webhook?.[process.env.ENVIRONMENT]
          .map(webhook => {
            return fetch(webhook, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${sessionCookie}`,
                'Content-Type': 'application/json',
                Cookie: `${process.env.HACKNEY_AUTH_COOKIE_NAME}=${sessionCookie}`
              },
              body: JSON.stringify({
                workflowId: workflow.id,
                workflowType: workflow.type,
                socialCareId: workflow.socialCareId,
                residentName: `${resident.firstName} ${resident.lastName}`,
                urgentSince: workflow.heldAt,
                formName: workflow.form.name,
                note: step.note,
              }),
            }).then(res => {
              res.text().then(out => {
                console.log(`[nextsteps][webhook] step ${step.id} of workflow ${workflow.id} (${res.status}: ${JSON.stringify(out)})`)
              }).catch(e => {
                throw e
              })
            }).catch(e => {
              throw e
            })
          })
      );
    } catch (e) {
      console.error(`[nextsteps][webhook][error] step ${step.id} of workflow ${workflow.id} (${e.toString()})`);
    }
  }

  // 5. mark the step as triggered so it isn't fired again
  await prisma.nextStep.update({
    where: { id: step.id },
    data: {
      triggeredAt: new Date(),
    },
  })
}

export const triggerNextSteps = async (
  workflow: WorkflowWithRelations,
  sessionCookie: string = null,
): Promise<void> => {
  const nextStepOptions = await nextStepOptionsForThisEnv()
  const forms = await formsForThisEnv()
  if (workflow.nextSteps) {
    await Promise.all(
      workflow.nextSteps.map(nextStep =>
        triggerNextStep(
          {
            ...nextStep,
            option: nextStepOptions.find(
              o => o.id === nextStep.nextStepOptionId
            ),
          },
          {
            ...workflow,
            form: forms.find(form => form.id === workflow.formId),
          },
          sessionCookie,
        )
      )
    )
  }
}
