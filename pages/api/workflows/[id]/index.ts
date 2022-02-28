import prisma from "../../../../lib/prisma"
import {NextApiRequest, NextApiResponse} from "next"
import {apiHandler} from "../../../../lib/apiHelpers"
import {middleware as csrfMiddleware} from '../../../../lib/csrfToken';
import answerFiltersForThisEnv from "../../../../config/answerFilters";
import {pick} from "lodash";

export const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  const {id} = req.query

  switch (req.method) {
    case "GET": {
      const {filter} = req.query
      const answerFilters = await answerFiltersForThisEnv();
      if (filter) {
        const validFilters = answerFilters.map(f => f.id);

        if (!validFilters.includes(filter as string)) {
          res.status(400)
            .json({error: `${filter} is not a valid filter, must be one of ${validFilters.join(', ')}`})

          return;
        }
      }

      const workflow = await prisma.workflow.findUnique({
        where: {
          id: id as string,
        },
      })

      if (filter) {
        const filterConfig = answerFilters.find(f => f.id === filter);

        workflow.answers = Object.entries(workflow.answers)
          .reduce((acc, [stepName, stepAnswers]) => {
              const trimmedStepAnswers = Object.fromEntries(Object.entries(stepAnswers).map(([key, value]) => {
                return [key.trim(), value]
              }))

              const filteredStepAnswers = pick(
                trimmedStepAnswers,
                filterConfig.answers[stepName]
              )

              if (Object.keys(filteredStepAnswers).length > 0)
                acc[stepName] = filteredStepAnswers
              return acc
            },
            {}
          )
      }

      res.status(200).json({workflow})
      break
    }

    case "PATCH": {
      const updatedSubmission = await prisma.workflow.update({
        data: JSON.parse(req.body),
        where: {
          id: id as string,
        },
      })
      res.status(200).json(updatedSubmission)
      break
    }

    case "DELETE": {
      const discardedSubmission = await prisma.workflow.update({
        data: {
          discardedAt: new Date(),
          discardedBy: req['user']?.email,
        },
        where: {
          id: id as string,
        },
      })
      res.status(204).json(discardedSubmission)
      break
    }

    default: {
      res.status(405).json({error: `${req.method} not supported on this endpoint`})
    }
  }
}

export default apiHandler(csrfMiddleware(handler))
