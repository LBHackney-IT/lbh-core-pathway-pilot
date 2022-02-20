import prisma from "../../../lib/prisma"
import { NextApiRequest, NextApiResponse } from "next"
import { apiHandler } from "../../../lib/apiHelpers"

import { middleware as csrfMiddleware } from "../../../lib/csrfToken"

import forms from "../../../config/forms"
import {
  QuickFilterOpts,
  WorkflowQueryParams as QueryParams,
} from "../../../hooks/useWorkflows"
import { Form } from "../../../types"
import { WorkflowForPlanner } from "."

export const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  switch (req.method) {
    case "GET": {
      const { query } = req.query as QueryParams

      const [workflows, resolvedForms] = await Promise.all([
        await prisma.$queryRaw<WorkflowForPlanner[]>`SELECT * FROM "Workflow"
        WHERE to_tsvector(answers) @@ websearch_to_tsquery('${query}');`,
        await forms(),
      ])

      res.json({
        workflows: workflows.map(workflow => ({
          ...workflow,
          form: resolvedForms.find(form => form.id === workflow.formId),
        })),
      })
      break
    }

    default: {
      res
        .status(405)
        .json({ error: `${req.method} not supported on this endpoint` })
    }
  }
}

export default apiHandler(csrfMiddleware(handler))
