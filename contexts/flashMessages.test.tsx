import { fireEvent, render, screen } from "@testing-library/react"
import {
  FlashMessageProvider,
  FlashMessages,
  useFlashMessages,
} from "./flashMessages"
import { useRouter } from "next/router"
import { act } from "react-dom/test-utils"

jest.mock("next/router")

let eventName
let routeChangeHandler
;(useRouter as jest.Mock).mockImplementation(() => {
  return {
    events: {
      on: jest.fn((event, callback) => {
        eventName = event
        routeChangeHandler = callback
      }),
      off: jest.fn((event, callback) => {
        eventName = event
        routeChangeHandler = callback
      }),
    },
  }
})

beforeEach(() => {
  jest.clearAllMocks()
})

describe("FlashMessageProvider", () => {
  it("returns children", () => {
    render(<FlashMessageProvider>Test</FlashMessageProvider>)
    expect(screen.getByText("Test"))
  })
})

describe("FlashMessages", () => {
  const MockComponent = () => {
    const { addMessage, clearMessages } = useFlashMessages()
    return (
      <>
        <FlashMessages />
        <button onClick={() => addMessage({ title: "foo", type: "success" })}>
          add
        </button>
        <button onClick={clearMessages}>clear</button>
      </>
    )
  }

  it("displays messages and allows new messages to be added", () => {
    render(
      <FlashMessageProvider>
        <MockComponent />
      </FlashMessageProvider>
    )
    expect(screen.queryByRole("alert")).toBeNull()
    fireEvent.click(screen.getByText("add"))
    expect(screen.getByRole("alert"))
    expect(screen.getByText("foo"))
  })

  it("allows all messages to be cleared", () => {
    render(
      <FlashMessageProvider>
        <MockComponent />
      </FlashMessageProvider>
    )

    fireEvent.click(screen.getByText("add"))
    expect(screen.getByRole("alert"))
    fireEvent.click(screen.getByText("clear"))
    expect(screen.queryByRole("alert")).toBeNull()
  })

  it("clears messages when the route next changes", () => {
    render(
      <FlashMessageProvider>
        <MockComponent />
      </FlashMessageProvider>
    )

    fireEvent.click(screen.getByText("add"))
    expect(screen.getByRole("alert"))
    // simulate route change
    act(() => routeChangeHandler())
    expect(screen.queryByRole("alert")).toBeNull()
  })
})
