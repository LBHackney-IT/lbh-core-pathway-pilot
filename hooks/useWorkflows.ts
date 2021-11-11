import { Team } from "@prisma/client"
import useSWR, { SWRResponse, useSWRInfinite, SWRInfiniteResponse } from "swr"
import queryString from "query-string"
import { Status } from "../types"
import { WorkflowForPlanner } from "../pages/api/workflows"

export interface WorkflowQueryParams {
  social_care_id?: string
  quick_filter?: QuickFilterOpts
  assigned_to?: string
  team_assigned_to?: Team
  show_historic?: boolean
  status?: Status
  page?: string
}

export enum QuickFilterOpts {
  All = "all",
  Me = "me",
  MyTeam = "my-team",
  AnotherTeam = "another-team",
  AnotherUser = "another-user",
}

const useWorkflows = (query: WorkflowQueryParams): SWRInfiniteResponse =>
  useSWRInfinite((pageIndex, previousPageData) => {
    // if (previousPageData && !previousPageData.length) return null

    return `/api/workflows?${queryString.stringify({
      ...query,
      page: pageIndex,
    })}`
  })

export default useWorkflows
