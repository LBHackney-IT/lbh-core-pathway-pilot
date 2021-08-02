import AssigneeWidget from "./AssigneeWidget"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { useRouter } from "next/router"

jest.mock("next/router")
;(useRouter as jest.Mock).mockReturnValue({
  push: jest.fn(),
})

global.fetch = jest.fn()

describe("AssigneeWidget", () => {})
