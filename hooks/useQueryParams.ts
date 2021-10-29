import { useRouter } from "next/router"
import qs from "query-string"
import { useState } from "react"

type SupportedTypes = string | number | boolean | (string | number | boolean)[]

export interface QueryParams {
  [key: string]: SupportedTypes
}

function useQueryParams<T extends QueryParams>(
  initialValue?: QueryParams
): [QueryParams, React.Dispatch<React.SetStateAction<T>>] {
  const { replace } = useRouter()
  const { origin, pathname, search } = window.location

  const parsedQueryParams = qs.parse(search, {
    parseBooleans: true,
    parseNumbers: true,
  })

  const [queryParams, setQueryParams] = useState<QueryParams>({
    ...initialValue,
    ...parsedQueryParams,
  })

  const updateQueryParams = updatedQueryParams => {
    const newQueryParams = { ...queryParams, ...updatedQueryParams }

    setQueryParams(newQueryParams)

    const stringifiedUpdatedQueryParams = qs.stringify(newQueryParams)

    if (`?${stringifiedUpdatedQueryParams}` !== search) {
      replace(
        `${origin}${pathname}?${stringifiedUpdatedQueryParams}`,
        undefined,
        {
          scroll: false,
        }
      )
    }
  }

  return [queryParams, updateQueryParams]
}

export default useQueryParams
