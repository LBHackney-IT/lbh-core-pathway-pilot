import prisma from "../../../../lib/prisma"
import {NextApiRequest, NextApiResponse} from "next"
import {apiHandler} from "../../../../lib/apiHelpers"
import {middleware as csrfMiddleware} from '../../../../lib/csrfToken';
import answerFilters from "../../../../config/answerFilters";

export const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  const {id} = req.query

  switch (req.method) {
    case "GET": {
      const {filter} = req.query
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
