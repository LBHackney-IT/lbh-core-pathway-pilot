import { useState, useCallback } from "react"
import { useRouter } from "next/router"
import queryString from "query-string"

type ReturnType = [string | null, (newVal: string | null) => void]

const useQueryState = (
  key: string,
  initialValue: string | null
): ReturnType => {
  const { replace } = useRouter()
  const query = queryString.parse(window.location.search)

  const applyQueryString = useCallback(
    newString => {
      const newUrl =
        window.location.protocol +
        "//" +
        window.location.host +
        window.location.pathname +
        newString
      replace(newUrl)
    },
    [replace]
  )

  const setQueryStringValue = useCallback(
    (key, value, query) => {
      const newObject = {
        ...query,
        [key]: value,
      }
      if (!value) delete newObject[key]
      const newString = queryString.stringify(newObject)
      applyQueryString(`?${newString}`)
    },
    [applyQueryString]
  )

  const getQueryStringValue = (key, query) => {
    return query[key]
  }

  const [value, setValue] = useState<string | null>(
    getQueryStringValue(key, query) || initialValue
  )

  const onSetValue = useCallback(
    newValue => {
      setValue(newValue)
      setQueryStringValue(key, newValue, query)
    },
    [key, query, setQueryStringValue]
  )

  return [value, onSetValue]
}

export default useQueryState
