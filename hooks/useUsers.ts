import {User} from "@prisma/client"
import {SWRResponse} from "swr"
import {CsrfSWR} from "../lib/csrfToken";

const useUsers = (url: string): SWRResponse<User[], Error> => CsrfSWR(url) as SWRResponse<User[], Error>;

export default useUsers
