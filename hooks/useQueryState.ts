import {useRouter} from "next/router"
import qs from "query-string"
import {useState} from "react"

type SupportedTypes = string | number | boolean | (string | number | boolean)[]

function useQueryState<T extends SupportedTypes>(
  key: string,
  initialValue?: T,
  deleteParams?: Array<string>,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const {replace} = useRouter()
  const {origin, pathname, search} = window.location

  const getValue = key => {
    const values = qs.parse(search, {
      parseBooleans: true,
      parseNumbers: true,
    })
    return values[key] as T
  }

  const [value, setValue] = useState<T>(getValue(key) || initialValue)

  const onSetValue = newValue => {
    setValue(newValue)

    const values = qs.parse(search)

    deleteParams?.forEach(p => delete values[p]);

    const newQuery = qs.stringify({
      ...values,
      [key]: newValue || undefined,
    })

    if (`?${newQuery}` !== search)
      replace(`${origin}${pathname}?${newQuery}`, undefined, {
        scroll: false,
      })
  }

  return [value, onSetValue]
}

export default useQueryState
