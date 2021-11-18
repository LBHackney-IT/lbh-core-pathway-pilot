import { Team } from "@prisma/client"
import useSWR, { SWRResponse } from "swr"
import { TeamKpis } from "../pages/api/teams/[id]/kpis"

const useTeamKpis = (team: Team): SWRResponse<TeamKpis, Error> =>
  useSWR(`/api/teams/${team.toLowerCase()}/kpis`)

export default useTeamKpis
