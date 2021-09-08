import allowedGroups from "../config/allowedGroups"
import { checkAuthorisedToLogin } from "./checkGoogleGroup"

describe("checkGoogleToken", () => {
  it("correctly handles an authorised user", async () => {
    ;(global.fetch as jest.Mock) = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            groups: [allowedGroups[0]],
          }),
      })
    )

    const result = await checkAuthorisedToLogin()
    expect(result).toBeTruthy()
  })

  it("correctly handles an unauthorised user", async () => {
    ;(global.fetch as jest.Mock) = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            groups: [],
          }),
      })
    )

    const result = await checkAuthorisedToLogin()
    expect(result).toBeFalsy()
  })
})
