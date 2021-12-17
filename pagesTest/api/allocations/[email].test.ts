import { handler } from "../../../pages/api/allocations/[email]"
import { getAllocationsByEmail } from "../../../lib/allocations"
import { mockUser } from "../../../fixtures/users"
import {NextApiRequest, NextApiResponse} from "next"

jest.mock("../../../lib/allocations")

describe("allocations list endpoint", () => {
  let response

  beforeEach(() => {
    response = {
      status: jest.fn().mockImplementation(() => response),
      json: jest.fn(),
    } as unknown as NextApiResponse
  })

  it("it returns a list of allocations for the specified email address", async () => {
    const request = {
      method: "GET",
      session: { user: mockUser },
      query: { email: "foo.bar@example.com" },
    } as unknown as NextApiRequest

    await handler(request, response)

    expect(getAllocationsByEmail).toBeCalledWith("foo.bar@example.com")
  })
})
