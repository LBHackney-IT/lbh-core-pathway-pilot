import { NextApiResponse } from "next"
import { Actions } from "../../../../components/ManagerApprovalDialog"
import { apiHandler, ApiRequestWithSession } from "../../../../lib/apiHelpers"
import { triggerNextSteps } from "../../../../lib/nextSteps"
import { notifyReturnedForEdits, notifyApprover } from "../../../../lib/notify"
import { middleware as csrfMiddleware } from "../../../../lib/csrfToken"
import prisma from "../../../../lib/prisma"
import { Action, Team } from ".prisma/client"
// import { addRecordToCase } from "../../../../lib/cases"

export const handler = async (
  req: ApiRequestWithSession,
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
        if (!req.session.user.panelApprover) {
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
            panelApprovedBy: req.session.user.email,
            assignedTo: null,
            teamAssignedTo: Team.Review,
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

        // await addRecordToCase(updatedWorkflow)
      } else {
        // manager approvals
        if (!req.session.user.approver) {
          return res
            .status(400)
            .json({ error: "You're not authorised to perform that action" })
        }

        const { panelApproverEmail, action } = JSON.parse(req.body)

        updatedWorkflow = await prisma.workflow.update({
          where: {
            id: id as string,
          },
          data: {
            managerApprovedAt: new Date(),
            managerApprovedBy: req.session.user.email,
            needsPanelApproval: action === Actions.ApproveWithQam,
            assignedTo:
              action === Actions.ApproveWithQam ? panelApproverEmail : null,
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

        // if (!updatedWorkflow.needsPanelApproval)
        //   await addRecordToCase(updatedWorkflow)

        await notifyApprover(
          updatedWorkflow,
          panelApproverEmail,
          process.env.NEXTAUTH_URL
        )
      }

      await triggerNextSteps(updatedWorkflow)

      res.json(updatedWorkflow)
      break
    }
    case "DELETE": {
      if (!req.session.user.approver && !req.session.user.panelApprover) {
        return res
          .status(400)
          .json({ error: "You're not authorised to perform that action" })
      }

      const { reason } = JSON.parse(req.body)
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
              text: reason,
              createdBy: req.session.user.email,
            },
          },
          revisions: {
            create: {
              answers: {},
              createdBy: req.session.user.email,
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
        req.session.user,
        process.env.NEXTAUTH_URL,
        reason
      )
      res.json(workflow)
      break
    }
    default: {
      res.status(405).json({ error: "Method not supported on this endpoint" })
    }
  }
}

export default apiHandler(csrfMiddleware(handler))
