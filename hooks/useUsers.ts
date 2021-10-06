import {User} from "@prisma/client"
import {SWRResponse} from "swr"
import {CsrfSWR} from "../lib/csrfToken";

const useUsers = (): SWRResponse<User[], Error> =>
  CsrfSWR('/api/users') as SWRResponse<User[], Error>;

export default useUsers
