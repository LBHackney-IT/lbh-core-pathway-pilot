import { NotifyClient } from "notifications-node-client"
import forms from "../config/forms"
import { Session } from "next-auth"
import { Prisma } from "@prisma/client"
import { emailReplyToId } from "../config"

const workflowWithRelations = Prisma.validator<Prisma.WorkflowArgs>()({
  include: {
    creator: true,
  },
})
type WorkflowWithRelations = Prisma.WorkflowGetPayload<
  typeof workflowWithRelations
>

/** send an email notification to someone that a submission needs their approval, swallowing any errors */
export const notifyApprover = async (
  workflow: WorkflowWithRelations,
  approverEmail: string,
  host: string
): Promise<void> => {
  try {
    const notifyClient = new NotifyClient(process.env.NOTIFY_API_KEY)

    return await notifyClient.sendEmail(
      process.env.NOTIFY_APPROVER_TEMPLATE_ID,
      approverEmail,
      {
        personalisation: {
          url: `${host}/workflows/${workflow.id}`,
          form_name: (await forms()).find(form => form.id === workflow?.formId)
            ?.name,
          resident_social_care_id: workflow.socialCareId,
          started_by: workflow?.creator?.name,
        },
        reference: `${workflow.id}-${approverEmail}`,
        emailReplyToId,
      }
    )
  } catch (e) {
    return
  }
}

/** send an email notification to an assignee that their submission has been rejected, swallowing any errors */
export const notifyReturnedForEdits = async (
  workflow: WorkflowWithRelations,
  rejector: Session["user"],
  host: string,
  rejectionReason?: string
): Promise<void> => {
  try {
    const notifyClient = new NotifyClient(process.env.NOTIFY_API_KEY)

    return await notifyClient.sendEmail(
      process.env.NOTIFY_RETURN_FOR_EDITS_TEMPLATE_ID,
      workflow.assignedTo,
      {
        personalisation: {
          url: `${host}/workflows/${workflow.id}`,
          form_name: (await forms()).find(form => form.id === workflow?.formId)
            ?.name,
          resident_social_care_id: workflow.socialCareId,
          started_by: workflow?.creator?.name,
          rejector: rejector?.name,
          reason: rejectionReason,
        },
        reference: `${workflow.id}-${rejector.email}`,
        emailReplyToId,
      }
    )
  } catch (e) {
    return
  }
}

/** send an email notification to a team when a next step is triggered for them, swallowing errors */
export const notifyNextStep = async (
  workflow: WorkflowWithRelations,
  teamEmail: string,
  host: string,
  note: string,
  title: string
): Promise<void> => {
  try {
    const notifyClient = new NotifyClient(process.env.NOTIFY_API_KEY)

    return await notifyClient.sendEmail(
      process.env.NOTIFY_NEXT_STEP_TEMPLATE_ID,
      teamEmail,
      {
        personalisation: {
          next_step_name: title,
          note,
          url: `${host}/workflows/${workflow.id}`,
          form_name: (await forms()).find(form => form.id === workflow?.formId)
            ?.name,
          resident_social_care_id: workflow.socialCareId,
          started_by: workflow?.creator?.name,
        },
        reference: `${workflow.id}-${teamEmail}`,
        emailReplyToId,
      }
    )
  } catch (e) {
    return
  }
}

/** send an email notification to someone that a submission needs their approval, swallowing any errors */
export const notifyAssignee = async (
  workflow: WorkflowWithRelations,
  assigneeEmail: string,
  host: string,
  assignerName: string
): Promise<void> => {
  try {
    const notifyClient = new NotifyClient(process.env.NOTIFY_API_KEY)

    return await notifyClient.sendEmail(
      process.env.NOTIFY_ASSIGNEE_TEMPLATE_ID,
      assigneeEmail,
      {
        personalisation: {
          assigner_name: assignerName,
          url: `${host}/workflows/${workflow.id}`,
          form_name: (await forms()).find(form => form.id === workflow?.formId)
            ?.name,
          resident_social_care_id: workflow.socialCareId,
          started_by: workflow?.creator?.name,
        },
        reference: `${workflow.id}-${assigneeEmail}`,
        emailReplyToId,
      }
    )
  } catch (e) {
    return
  }
}
