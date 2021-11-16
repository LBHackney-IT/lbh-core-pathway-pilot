import prisma from "../../../lib/prisma"
import { NextApiResponse } from "next"
import { apiHandler, ApiRequestWithSession } from "../../../lib/apiHelpers"
import { newWorkflowSchema } from "../../../lib/validators"
import { getResidentById } from "../../../lib/residents"
import { middleware as csrfMiddleware } from "../../../lib/csrfToken"
import { perPage } from "../../../config"
import { Prisma, WorkflowType } from ".prisma/client"
import { filterByStatus } from "../../../lib/filters"
import forms from "../../../config/forms"
import {
  QuickFilterOpts,
  WorkflowQueryParams as QueryParams,
} from "../../../hooks/useWorkflows"
import { Form } from "../../../types"

const workflowForPlanner = Prisma.validator<Prisma.WorkflowArgs>()({
  select: {
    id: true,
    createdAt: true,
    submittedAt: true,
    managerApprovedAt: true,
    reviewBefore: true,
    socialCareId: true,
    formId: true,
    answers: true,
    type: true,
    heldAt: true,
    assignee: {
      select: {
        email: true,
        name: true,
      },
    },
  },
})
export type WorkflowForPlanner = Prisma.WorkflowGetPayload<
  typeof workflowForPlanner
> & { form?: Form }

export const handler = async (
  req: ApiRequestWithSession,
  res: NextApiResponse
): Promise<void> => {
  switch (req.method) {
    case "GET": {
      const {
        social_care_id,
        quick_filter,
        assigned_to,
        team_assigned_to,
        show_historic,
        status,
        touched_by_me,
        page,
        order,
      } = req.query as QueryParams

      const where = {
        type: {
          in: [
            WorkflowType.Reassessment,
            WorkflowType.Review,
            WorkflowType.Assessment,
          ],
        },
        discardedAt: null,
        // status
        AND: [filterByStatus(status)],
      } as Prisma.WorkflowWhereInput

      // workflow types
      if (show_historic) where.type = undefined

      // social care id
      if (social_care_id) where.socialCareId = social_care_id

      // quick filters + assignment
      switch (quick_filter) {
        case QuickFilterOpts.Me: {
          if (touched_by_me) {
            ;(where.AND as Array<Prisma.WorkflowWhereInput>).push({
              OR: [
                { assignedTo: req.session.user.email },
                { createdBy: req.session.user.email },
                { submittedBy: req.session.user.email },
                { managerApprovedBy: req.session.user.email },
                { panelApprovedBy: req.session.user.email },
                { acknowledgedBy: req.session.user.email },
              ],
            })
          } else {
            where.assignedTo = req.session.user.email
          }
          break
        }
        case QuickFilterOpts.MyTeam: {
          where.teamAssignedTo = req.session.user.team
          break
        }
        case QuickFilterOpts.AnotherTeam: {
          where.teamAssignedTo = team_assigned_to
          break
        }
        case QuickFilterOpts.AnotherUser: {
          where.assignedTo = assigned_to
          break
        }
      }

      const [workflows, count, resolvedForms] = await Promise.all([
        await prisma.workflow.findMany({
          where,
          take: perPage,
          skip: parseInt(page) > 0 ? parseInt(page) * perPage + 1 : 0,
          select: {
            id: true,
            createdAt: true,
            submittedAt: true,
            managerApprovedAt: true,
            reviewBefore: true,
            socialCareId: true,
            formId: true,
            answers: true,
            type: true,
            heldAt: true,
            assignee: {
              select: {
                email: true,
                name: true,
              },
            },
          },
          orderBy: [
            {
              // urgent things first
              heldAt: "asc",
            },
            {
              // if order isn't given, oldest first
              createdAt: order || "asc",
            },
          ],
        }),
        await prisma.workflow.count({ where }),
        await forms(),
      ])

      res.json({
        workflows: workflows.map(workflow => ({
          ...workflow,
          form: resolvedForms.find(form => form.id === workflow.formId),
        })),
        count,
      })
      break
    }
    case "POST": {
      const data = JSON.parse(req.body)

      if (!(await getResidentById(data.socialCareId))) {
        res.status(404).json({ error: "Resident does not exist." })
        break
      }

      await newWorkflowSchema(await forms()).validate(data)

      const newWorkflow = await prisma.workflow.create({
        data: {
          ...data,
          createdBy: req.session.user.email,
          updatedBy: req.session.user.email,
          assignedTo: req.session.user.email,
          teamAssignedTo: req.session.user?.team,
        },
      })

      res.status(201).json(newWorkflow)
      break
    }

    default: {
      res.status(405).json({ error: "Method not supported on this endpoint" })
    }
  }
}

export default apiHandler(csrfMiddleware(handler))
