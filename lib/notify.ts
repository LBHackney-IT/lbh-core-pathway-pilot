import { NotifyClient } from "notifications-node-client"
import forms from "../config/forms"
import { Session } from "next-auth"
import { Prisma } from "@prisma/client"

const workflowWithRelations = Prisma.validator<Prisma.WorkflowArgs>()({
  include: {
    creator: true,
  },
})
type WorkflowWithRelations = Prisma.WorkflowGetPayload<
  typeof workflowWithRelations
>

/** send an email notification to someone that a submission needs their approval */
export const notifyApprover = async (
  workflow: WorkflowWithRelations,
  approverEmail: string,
  host: string
): Promise<void> => {
  const notifyClient = new NotifyClient(process.env.NOTIFY_API_KEY)

  return await notifyClient.sendEmail(
    process.env.NOTIFY_APPROVER_TEMPLATE_ID,
    approverEmail,
    {
      personalisation: {
        url: `${host}/workflows/${workflow.id}`,
        form_name: forms.find(form => form.id === workflow?.formId)?.name,
        resident_social_care_id: workflow.socialCareId,
        started_by: workflow?.creator?.name,
      },
      reference: `${workflow.id}-${approverEmail}`,
    }
  )
}

/** send an email notification to an assignee that their submission has been rejected */
export const notifyReturnedForEdits = async (
  workflow: WorkflowWithRelations,
  rejector: Session["user"],
  host: string,
  rejectionReason?: string
): Promise<void> => {
  const notifyClient = new NotifyClient(process.env.NOTIFY_API_KEY)
  return await notifyClient.sendEmail(
    process.env.NOTIFY_RETURN_FOR_EDITS_TEMPLATE_ID,
    workflow.assignedTo,
    {
      personalisation: {
        url: `${host}/workflows/${workflow.id}`,
        form_name: forms.find(form => form.id === workflow?.formId)?.name,
        resident_social_care_id: workflow.socialCareId,
        started_by: workflow?.creator?.name,
        rejector: rejector?.name,
        reason: rejectionReason,
      },
      reference: `${workflow.id}-${rejector.email}`,
    }
  )
}

/** send an email notification to a team when a next step is triggered for them */
export const notifyNextStep = async (
  workflow: WorkflowWithRelations,
  teamEmail: string,
  host: string
): Promise<void> => {
  const notifyClient = new NotifyClient(process.env.NOTIFY_API_KEY)

  return await notifyClient.sendEmail(
    process.env.NOTIFY_NEXT_STEP_TEMPLATE_ID,
    teamEmail,
    {
      personalisation: {
        next_step_name: "",
        note: "",
        url: `${host}/workflows/${workflow.id}`,
        form_name: forms.find(form => form.id === workflow?.formId)?.name,
        resident_social_care_id: workflow.socialCareId,
        started_by: workflow?.creator?.name,
      },
      reference: `${workflow.id}-${teamEmail}`,
    }
  )
}
