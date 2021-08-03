import { useState, useCallback } from "react"
import { useRouter } from "next/router"
import queryString from "query-string"

type ReturnType = [string | null, (newVal: string | null) => void]

const useQuery = (key: string, initialValue: string | null): ReturnType => {
  const { query, replace } = useRouter()

  const applyQueryString = newString => {
    const newUrl =
      window.location.protocol +
      "//" +
      window.location.host +
      window.location.pathname +
      newString
    replace(newUrl)
  }

  const setQueryStringValue = (key, value, query) => {
    const newObject = {
      ...query,
      [key]: value,
    }
    if (!value) delete newObject[key]
    const newString = queryString.stringify(newObject)
    applyQueryString(`?${newString}`)
  }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key]
  )

  return [value, onSetValue]
}

export default useQuery
