import { Team, Prisma } from "@prisma/client"
import { useSWRInfinite, SWRInfiniteResponse } from "swr"
import queryString from "query-string"
import { Status } from "../types"

export interface WorkflowQueryParams {
  social_care_id?: string
  quick_filter?: QuickFilterOpts
  assigned_to?: string
  team_assigned_to?: Team
  show_historic?: boolean
  status?: Status
  touched_by_me?: boolean
  page?: string
  order?: Prisma.SortOrder
  touched_by_me?: boolean
}

export enum QuickFilterOpts {
  All = "all",
  Me = "me",
  MyTeam = "my-team",
  AnotherTeam = "another-team",
  AnotherUser = "another-user",
}

const useWorkflows = (query: WorkflowQueryParams): SWRInfiniteResponse =>
  useSWRInfinite(
    pageIndex =>
      `/api/workflows?${queryString.stringify({
        ...query,
        page: pageIndex,
      })}`
  )

export default useWorkflows
