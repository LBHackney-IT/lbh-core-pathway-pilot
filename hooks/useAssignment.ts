import { Prisma } from "@prisma/client"
import useSWR, { SWRResponse } from "swr"

const workflowAssignment = Prisma.validator<Prisma.WorkflowArgs>()({
  select: {
    assignee: true,
    assignedTeam: true,
  },
})

type WorkflowAssignment = Prisma.WorkflowGetPayload<typeof workflowAssignment>

const useAssignment = (id: string): SWRResponse<WorkflowAssignment, Error> =>
  useSWR(`/api/workflows/${id}/assignment`)

export default useAssignment
