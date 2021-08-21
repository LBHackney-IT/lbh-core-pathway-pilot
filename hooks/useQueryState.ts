import { useRouter } from "next/router"
import queryString from "query-string"
import { useEffect, useState } from "react"

type SupportedTypes = string | number | boolean | (string | number | boolean)[]

function useQueryState<T extends SupportedTypes>(
  key: string,
  initialValue?: T
): [T, (newVal: T) => void] {
  const { push } = useRouter()

  const { origin, pathname, search } = window.location
  const query = queryString.parse(search, {
    parseBooleans: true,
    parseNumbers: true,
  })

  const getValue = () => {
    try {
      return query[key] ? (query[key] as T) : initialValue
    } catch (e) {
      return initialValue
    }
  }

  const [value, setValue] = useState<T>(getValue())

  useEffect(() => {
    const newQuery = queryString.stringify({
      ...query,
      [key]: value || undefined,
    })
    push(`${origin}${pathname}?${newQuery}`, undefined, {
      scroll: false,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, key])

  return [value, setValue]
}

export default useQueryState
