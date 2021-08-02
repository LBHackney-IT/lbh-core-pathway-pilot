import { User } from "@prisma/client"
import useSWR, { SWRResponse } from "swr"

const useUsers = (): SWRResponse<User[], Error> => useSWR(`/api/users`)

export default useUsers
