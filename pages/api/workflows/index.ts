import prisma from "../../../lib/prisma"
import { NextApiResponse } from "next"
import { apiHandler, ApiRequestWithSession } from "../../../lib/apiHelpers"
import { newWorkflowSchema } from "../../../lib/validators"
import forms from "../../../config/forms"
import {getResidentById} from "../../../lib/residents";
import { middleware as csrfMiddleware } from '../../../lib/csrfToken';

export const handler = async (
  req: ApiRequestWithSession,
  res: NextApiResponse
): Promise<void> => {
  switch (req.method) {
    case "POST": {
      const data = JSON.parse(req.body)

      if (!await getResidentById(data.socialCareId)) {
        res.status(404).json({ error: "Resident does not exist." });
        break;
      }

      await newWorkflowSchema(await forms()).validate(data);

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
