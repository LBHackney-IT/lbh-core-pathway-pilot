import { useEffect, useRef, useState } from "react"

const NextGenSearch = (): React.ReactElement | null => {
  const [open, setOpen] = useState<boolean>(false)

  const ref = useRef(null)

  useEffect(() => {
    const listener = event => {
      if (!ref.current || ref.current.contains(event.target)) return
      setOpen(false)
    }

    document.addEventListener("mousedown", listener)
    document.addEventListener("touchstart", listener)

    return () => {
      document.removeEventListener("mousedown", listener)
      document.removeEventListener("touchstart", listener)
    }
  }, [ref, setOpen])

  if (process.env.NEXT_PUBLIC_SEARCH_URL)
    return (
      <>
        <button onClick={() => setOpen(!open)}>Search</button>

        {open && (
          <form method="get" action={process.env.NEXT_PUBLIC_SEARCH_URL}>
            <label
              className="govuk-visually-hidden"
              htmlFor="search_query"
            ></label>
            <input
              name="query"
              id="search_query"
              className="govuk-input lbh-input"
              placeholder="Search..."
            />
          </form>
        )}
      </>
    )

  return null
}

export default NextGenSearch
