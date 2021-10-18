import { render, screen } from "@testing-library/react"
import useSearch from "./useSearch"

const documents = [
  {
    id: "foo",
    name: "namey mcname",
  },
  {
    id: "bar",
    name: "firstname surname",
  },
]

const MockComponent = ({
  query,
  minChar,
}: {
  query: string
  minChar?: number
}): React.ReactElement => {
  const results = useSearch(query, documents, ["id", "name"], {}, minChar)
  return <>{JSON.stringify(results)}</>
}

describe("useSearch", () => {
  it("returns matching results", () => {
    render(<MockComponent query={"foo"} />)
    expect(screen.getByText(JSON.stringify(documents[0]), { exact: false }))
  })

  it("supports a custom character count", () => {
    render(<MockComponent query={"foo"} minChar={500} />)
    expect(screen.getByText(JSON.stringify(documents), { exact: false }))
  })

  it("does nothing if minimum character count isn't met", () => {
    render(<MockComponent query={"f"} />)
    expect(screen.getByText(JSON.stringify(documents), { exact: false }))
  })
})
