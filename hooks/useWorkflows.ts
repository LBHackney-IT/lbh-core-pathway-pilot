import { Workflow } from "@prisma/client"
import useSWR, { SWRResponse } from "swr"
import queryString from "query-string"
import { QueryParams } from "./useQueryParams"

const useWorkflows = (query: QueryParams): SWRResponse<Workflow[], Error> =>
  useSWR(`/api/workflows?=${queryString.stringify(query)}`)

export default useWorkflows
