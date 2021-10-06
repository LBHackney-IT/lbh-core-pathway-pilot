import allowedGroups, { pilotGroup } from "../config/allowedGroups"
import { checkAuthorisedToLogin, isInPilotGroup } from "./googleGroups"
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
    let switchBack

    beforeAll(() => (switchBack = switchEnv("development")))
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
  })

  describe("when in production", () => {
    const error = console.error
    let switchBack

    beforeEach(() => {
      console.error = jest.fn()
    })

    beforeAll(() => {
      switchBack = switchEnv("production")
    })

    afterAll(() => {
      switchBack()
      console.error = error
    })

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

    it("returns false if cookie is signed with invalid JWT secret", async () => {
      const mockRes = {
        headers: {
          cookie: cookie.serialize(
            process.env.GSSO_TOKEN_NAME,
            jwt.sign({}, "some-invalid-secret")
          ),
        },
      }

      const result = await checkAuthorisedToLogin(mockRes as NextApiRequest)

      expect(result).toBe(false)
      expect(console.error).toHaveBeenCalledWith(
        "[auth][error] unable to authorise user: JsonWebTokenError: invalid signature"
      )
    })

    it("returns false if cookie is signed with invalid cookie name", async () => {
      const mockRes = {
        headers: {
          cookie: cookie.serialize(
            "some-invalid-cookie-name",
            jwt.sign({}, process.env.HACKNEY_JWT_SECRET)
          ),
        },
      }

      const result = await checkAuthorisedToLogin(mockRes as NextApiRequest)

      expect(result).toBe(false)
      expect(console.error).toHaveBeenCalledWith(
        "[auth][error] unable to authorise user: JsonWebTokenError: jwt must be provided"
      )
    })

    it("returns false if user has no groups", async () => {
      const mockRes = {
        headers: {
          cookie: cookie.serialize(
            process.env.GSSO_TOKEN_NAME,
            jwt.sign({ groups: [] }, process.env.HACKNEY_JWT_SECRET)
          ),
        },
      }

      const result = await checkAuthorisedToLogin(mockRes as NextApiRequest)

      expect(result).toBe(false)
    })

    it("returns false if user has no allowed groups", async () => {
      const mockRes = {
        headers: {
          cookie: cookie.serialize(
            process.env.GSSO_TOKEN_NAME,
            jwt.sign(
              {
                groups: [
                  "some-unauthorised-group",
                  "another-unauthorised-group",
                ],
              },
              process.env.HACKNEY_JWT_SECRET
            )
          ),
        },
      }

      const result = await checkAuthorisedToLogin(mockRes as NextApiRequest)

      expect(result).toBe(false)
    })
  })
})

describe("isInPilotGroup", () => {
  ;["development", "test"].forEach(environment => {
    describe(`when in ${environment}`, () => {
      let switchBack

      beforeAll(() => (switchBack = switchEnv(environment)))
      afterAll(() => switchBack())

      it("returns true", async () => {
        const mockCookie = cookie.serialize(
          process.env.GSSO_TOKEN_NAME,
          jwt.sign(
            {
              groups: [allowedGroups[0]],
            },
            process.env.HACKNEY_JWT_SECRET
          )
        )

        const result = await isInPilotGroup(mockCookie)

        expect(result).toBeTruthy()
      })
    })
  })

  describe("when in production", () => {
    const error = console.error
    let switchBack

    beforeEach(() => {
      console.error = jest.fn()
    })

    beforeAll(() => {
      switchBack = switchEnv("production")
    })

    afterAll(() => {
      switchBack()
      console.error = error
    })

    it("returns true if user is in pilot group", async () => {
      const mockCookie = cookie.serialize(
        process.env.GSSO_TOKEN_NAME,
        jwt.sign(
          {
            groups: [pilotGroup],
          },
          process.env.HACKNEY_JWT_SECRET
        )
      )

      const result = await isInPilotGroup(mockCookie)

      expect(result).toBeTruthy()
    })

    it("returns false if cookie is signed with invalid JWT secret", async () => {
      const mockCookie = cookie.serialize(
        process.env.GSSO_TOKEN_NAME,
        jwt.sign({}, "some-invalid-secret")
      )

      const result = await isInPilotGroup(mockCookie)

      expect(result).toBe(false)
      expect(console.error).toHaveBeenCalledWith(
        "[auth][error] unable to determine user's Google Groups: JsonWebTokenError: invalid signature"
      )
    })

    it("returns false if cookie is signed with invalid cookie name", async () => {
      const mockCookie = cookie.serialize(
        "some-invalid-cookie-name",
        jwt.sign({}, process.env.HACKNEY_JWT_SECRET)
      )

      const result = await isInPilotGroup(mockCookie)

      expect(result).toBe(false)
      expect(console.error).toHaveBeenCalledWith(
        "[auth][error] unable to determine user's Google Groups: JsonWebTokenError: jwt must be provided"
      )
    })

    it("returns false if user has no groups", async () => {
      const mockCookie = cookie.serialize(
        process.env.GSSO_TOKEN_NAME,
        jwt.sign({ groups: [] }, process.env.HACKNEY_JWT_SECRET)
      )

      const result = await isInPilotGroup(mockCookie)

      expect(result).toBe(false)
    })

    it("returns false if user has groups but not the pilot group", async () => {
      const mockCookie = cookie.serialize(
        process.env.GSSO_TOKEN_NAME,
        jwt.sign(
          {
            groups: ["some-non-pilot-group", "another-non-pilot-group"],
          },
          process.env.HACKNEY_JWT_SECRET
        )
      )
      const result = await isInPilotGroup(mockCookie)

      expect(result).toBe(false)
    })
  })
})
