import useWarnUnsavedChanges from "./useWarnUnsavedChanges"
import { render } from "@testing-library/react"
import { useRouter } from "next/router"
import { act } from "react-dom/test-utils"

window.confirm = jest.fn()
jest.mock("next/router")

let routeChangeHandler
;(useRouter as jest.Mock).mockImplementation(() => {
  return {
    events: {
      on: jest.fn((event, callback) => {
        routeChangeHandler = callback
      }),
      off: jest.fn(),
    },
  }
})

beforeEach(() => {
  jest.clearAllMocks()
})

const MockComponent = ({ unsavedChanges }: { unsavedChanges: boolean }) => {
  useWarnUnsavedChanges(unsavedChanges)
  return null
}

// these tests don't look perfect, but testing for a thrown error gets very complicated very quickly
// next doesn't have a good way to abort/cancel a pending route change without throwing an error
describe("useWarnUnsavedChanges", () => {
  it("does nothing when there are no unsaved changes", () => {
    expect(() => {
      render(<MockComponent unsavedChanges={false} />)
      // simulate route change
      act(() => routeChangeHandler())
    }).not.toThrow()
  })

  it("can show a confirmation warning if there are unsaved changes", () => {
    try {
      render(<MockComponent unsavedChanges={true} />)
      // simulate route change
      act(() => routeChangeHandler())
    } catch (e) {
      null
    }
    expect(window.confirm).toBeCalled()
  })
})
