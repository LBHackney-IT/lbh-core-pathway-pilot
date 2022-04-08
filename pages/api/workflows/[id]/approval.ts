import {NextApiRequest, NextApiResponse} from "next"
import { ApprovalActions } from "../../../../components/ManagerApprovalDialog"
import { apiHandler } from "../../../../lib/apiHelpers"
import { triggerNextSteps } from "../../../../lib/nextSteps"
import { notifyReturnedForEdits, notifyApprover } from "../../../../lib/notify"
import { middleware as csrfMiddleware } from "../../../../lib/csrfToken"
import prisma from "../../../../lib/prisma"
import { Action, Team } from ".prisma/client"
import { addRecordToCase } from "../../../../lib/cases"

export const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const { id } = req.query

  switch (req.method) {
    case "POST": {
      const workflow = await prisma.workflow.findUnique({
        where: {
          id: id as string,
        },
      })

      let updatedWorkflow

      if (workflow.managerApprovedAt) {
        // panel approvals
        if (!req['user']?.panelApprover) {
          return res
            .status(400)
            .json({ error: "You're not authorised to perform that action" })
        }

        updatedWorkflow = await prisma.workflow.update({
          where: {
            id: id as string,
          },
          data: {
            panelApprovedAt: new Date(),
            panelApprovedBy: req['user']?.email,
            assignedTo: null,
            teamAssignedTo: Team.Review,
            revisions: {
              create: {
                answers: {},
                action: "Authorised",
                createdBy: req['user'].email,
              },
            },
          },
          include: {
            nextSteps: {
              where: {
                triggeredAt: null,
              },
            },
            creator: true,
          },
        })

        await addRecordToCase(updatedWorkflow)
      } else {
        // manager approvals
        if (!req['user']?.approver) {
          return res
            .status(400)
            .json({ error: "You're not authorised to perform that action" })
        }

        const { panelApproverEmail, action, comment } = JSON.parse(req.body)

        updatedWorkflow = await prisma.workflow.update({
          where: {
            id: id as string,
          },
          data: {
            managerApprovedAt: new Date(),
            managerApprovedBy: req['user'].email,
            needsPanelApproval: action === ApprovalActions.ApproveWithQam,
            assignedTo:
              action === ApprovalActions.ApproveWithQam
                ? panelApproverEmail
                : null,
            revisions: {
              create: {
                answers: {},
                action: "Approved",
                createdBy: req['user'].email,
              },
            },
            comments: comment
              ? {
                  create: {
                    text: comment,
                    createdBy: req['user'].email,
                    action: Action.Approved,
                  },
                }
              : undefined,
          },
          include: {
            nextSteps: {
              where: {
                triggeredAt: null,
              },
            },
            creator: true,
          },
        })

        if (!updatedWorkflow.needsPanelApproval)
          await addRecordToCase(updatedWorkflow)

        await notifyApprover(
          updatedWorkflow,
          panelApproverEmail,
          process.env.APP_URL
        )
      }

      await triggerNextSteps(updatedWorkflow, req.cookies[process.env.HACKNEY_AUTH_COOKIE_NAME])

      res.json(updatedWorkflow)
      break
    }
    case "DELETE": {
      if (!req['user']?.approver && !req['user']?.panelApprover) {
        return res
          .status(400)
          .json({ error: "You're not authorised to perform that action" })
      }

      const { comment } = JSON.parse(req.body)

      const workflowBeforeUpdate = await prisma.workflow.findUnique({
        where: {
          id: id as string,
        },
      })
      const workflow = await prisma.workflow.update({
        where: {
          id: id as string,
        },
        data: {
          managerApprovedAt: null,
          submittedAt: null,
          assignedTo: workflowBeforeUpdate.submittedBy,
          comments: {
            create: {
              text: comment,
              createdBy: req['user']?.email,
              action: Action.ReturnedForEdits,
            },
          },
          revisions: {
            create: {
              answers: {},
              createdBy: req['user']?.email,
              action: Action.ReturnedForEdits,
            },
          },
        },
        include: {
          creator: true,
        },
      })
      await notifyReturnedForEdits(
        workflow,
        req['user'],
        process.env.APP_URL,
        comment
      )
      res.json(workflow)
      break
    }
    default: {
      res.status(405).json({ error: `${req.method} not supported on this endpoint` })
    }
  }
}

export default apiHandler(csrfMiddleware(handler))
