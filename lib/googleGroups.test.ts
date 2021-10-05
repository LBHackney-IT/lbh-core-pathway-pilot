import allowedGroups from "../config/allowedGroups"
import { checkAuthorisedToLogin } from "./googleGroups"
import cookie from "cookie"
import jwt from "jsonwebtoken"
import { NextApiRequest } from "next"

process.env.GSSO_TOKEN_NAME = "foo"
process.env.HACKNEY_JWT_SECRET = "secret"

const switchEnv = environment => {
  const oldEnv = process.env.NODE_ENV
  process.env.NEXT_PUBLIC_ENV = environment
  // @ts-ignore
  process.env.NODE_ENV = environment

  return () => switchEnv(oldEnv)
}

describe("checkAuthorisedToLogin", () => {
  describe("when in development", () => {
    let switchBack;

    beforeAll(() => switchBack = switchEnv("development"))
    afterAll(() => switchBack())

    it("returns true", async () => {
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
  });

  describe("when in production", () => {
    let switchBack;

    beforeAll(() => switchBack = switchEnv("production"))
    afterAll(() => switchBack())

    it("returns true if an authorised user", async () => {
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

    it("returns false if an unauthorised user", async () => {
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
  });
})
