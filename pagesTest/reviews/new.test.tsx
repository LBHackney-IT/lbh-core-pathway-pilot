import { GetServerSidePropsContext } from "next"
import { mockWorkflowWithExtras } from "../../fixtures/workflows"
import { ParsedUrlQuery } from "querystring"
import { getServerSideProps } from "../../pages/reviews/new"
import cookie from "cookie"
import jwt from "jsonwebtoken"
import { pilotGroup } from "../../config/allowedGroups"

process.env.GSSO_TOKEN_NAME = "foo"
process.env.HACKNEY_JWT_SECRET = "secret"

jest.mock("../../lib/prisma", () => ({
  workflow: {
    findUnique: jest
      .fn()
      .mockResolvedValue({ ...mockWorkflowWithExtras, nextReview: null }),
  },
}))

describe("getServerSideProps", () => {
  it("returns the previous workflow as props", async () => {
    const response = await getServerSideProps({
      query: {
        id: mockWorkflowWithExtras.id,
      } as ParsedUrlQuery,
      req: {
        headers: {
          referer: "http://example.com",
          cookie: cookie.serialize(
            process.env.GSSO_TOKEN_NAME,
            jwt.sign(
              {
                groups: [pilotGroup],
              },
              process.env.HACKNEY_JWT_SECRET
            )
          ),
        },
      },
    } as GetServerSidePropsContext)

    expect(response).toHaveProperty(
      "props",
      expect.objectContaining({
        id: mockWorkflowWithExtras.id,
      })
    )
  })

  it("redirects back if user is not in pilot group", async () => {
    const response = await getServerSideProps({
      query: {
        id: mockWorkflowWithExtras.id,
      } as ParsedUrlQuery,
      req: {
        headers: {
          referer: "http://example.com",
          cookie: cookie.serialize(
            process.env.GSSO_TOKEN_NAME,
            jwt.sign(
              {
                groups: ["some-non-pilot-group"],
              },
              process.env.HACKNEY_JWT_SECRET
            )
          ),
        },
      },
    } as GetServerSidePropsContext)

    expect(response).toHaveProperty("redirect", {
      destination: "http://example.com",
    })
  })

  it("redirects back to if user is not in pilot group and no referer", async () => {
    const response = await getServerSideProps({
      query: {
        id: mockWorkflowWithExtras.id,
      } as ParsedUrlQuery,
      req: {
        headers: {
          cookie: cookie.serialize(
            process.env.GSSO_TOKEN_NAME,
            jwt.sign(
              {
                groups: ["some-non-pilot-group"],
              },
              process.env.HACKNEY_JWT_SECRET
            )
          ),
        },
      },
    } as GetServerSidePropsContext)

    expect(response).toHaveProperty("redirect", {
      destination: "/",
    })
  })
})
