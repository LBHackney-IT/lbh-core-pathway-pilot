import {User} from "@prisma/client"
import useSWR, {SWRResponse} from "swr"

const csrfFetcher = async (url: string, csrfToken: string): Promise<User[]> =>
  await (await fetch(url, {headers: {'XSRF-TOKEN': csrfToken}})).json();

const useUsers = (csrfToken: string): SWRResponse<User[], Error> => useSWR(['/api/users', csrfToken], csrfFetcher);

export default useUsers
