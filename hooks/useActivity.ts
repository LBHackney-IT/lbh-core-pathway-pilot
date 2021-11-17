import { useSWRInfinite, SWRInfiniteResponse } from "swr"
import { RevisionForActivityFeed } from "../pages/api/activity"

const useActivity = (): SWRInfiniteResponse<RevisionForActivityFeed[], Error> =>
  useSWRInfinite(pageIndex => `/api/activity?page=${pageIndex}`)

export default useActivity
