import allowedGroups from "../config/allowedGroups"
import { checkAuthorisedToLogin } from "./googleGroups"
import cookie from "cookie"
import jwt from "jsonwebtoken"
import { NextApiRequest } from "next"

process.env.GSSO_TOKEN_NAME = "foo"
process.env.HACKNEY_JWT_SECRET = "secret"

describe("checkGoogleToken", () => {
  it("correctly handles an authorised user", async () => {
    const mockRes = {
      headers: {
        cookie: cookie.serialize(
          process.env.GSSO_TOKEN_NAME,
          jwt.sign(
            {
              groups: [allowedGroups[0]],
            },
            process.env.HACKNEY_JWT_SECRET
          )
        ),
      },
    }

    const result = await checkAuthorisedToLogin(mockRes as NextApiRequest)
    expect(result).toBeTruthy()
  })

  it("correctly handles an unauthorised user", async () => {
    const mockRes = {
      headers: {
        cookie: cookie.serialize(
          process.env.GSSO_TOKEN_NAME,
          jwt.sign(
            {
              groups: [],
            },
            process.env.HACKNEY_JWT_SECRET
          )
        ),
      },
    }

    const result = await checkAuthorisedToLogin(mockRes as NextApiRequest)
    expect(result).toBeFalsy()
  })
})
