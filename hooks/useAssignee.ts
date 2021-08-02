import { User } from "@prisma/client"
import useSWR, { SWRResponse } from "swr"

const useAssignee = (id: string): SWRResponse<User, Error> =>
  useSWR(`/api/workflows/${id}/assignee`)

export default useAssignee
