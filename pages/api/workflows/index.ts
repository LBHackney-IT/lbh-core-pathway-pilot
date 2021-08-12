import prisma from "../../../lib/prisma"
import { NextApiResponse } from "next"
import { apiHandler, ApiRequestWithSession } from "../../../lib/apiHelpers"
import { AssessmentType } from "@prisma/client"
import { newWorkflowSchema } from "../../../lib/validators"
import { FlexibleAnswers } from "../../../types"
import { groupAnswersByTheme } from "../../../lib/taskList"

/** pull out the themes marked as for review, so they don't get prefilled into the new workflow */
const removeThemesToReview = (
  themesToReview: string[],
  oldAnswers: FlexibleAnswers
): FlexibleAnswers => {
  // TODO: make this work
  return oldAnswers
  let newAnswers = {}
  Object.entries(groupAnswersByTheme(oldAnswers)).forEach(
    ([themeName, themeAnswers]) => {
      if (themesToReview.includes(themeName)) return null
      newAnswers = {
        ...newAnswers,
        ...themeAnswers,
      }
    }
  )
  return newAnswers
}

const handler = async (req: ApiRequestWithSession, res: NextApiResponse) => {
  switch (req.method) {
    case "POST": {
      const data = JSON.parse(req.body)
      newWorkflowSchema.validate(data)

      let newWorkflow

      // is it a review of something?
      if (data.workflowId) {
        const previousWorkflow = await prisma.workflow.findUnique({
          where: {
            id: data.workflowId,
          },
        })
        newWorkflow = await prisma.workflow.create({
          data: {
            ...data,
            answers: removeThemesToReview(
              data.themesToReview,
              previousWorkflow.answers as FlexibleAnswers
            ),
            createdBy: req.session.user.email,
            updatedBy: req.session.user.email,
            assignedTo: req.session.user.email,
          },
        })
      } else {
        newWorkflow = await prisma.workflow.create({
          data: {
            ...data,
            createdBy: req.session.user.email,
            updatedBy: req.session.user.email,
            assignedTo: req.session.user.email,
          },
        })
      }

      res.status(201).json(newWorkflow)
      break
    }

    default: {
      res.status(405).json({ error: "Method not supported on this endpoint" })
    }
  }
}

export default apiHandler(handler)
