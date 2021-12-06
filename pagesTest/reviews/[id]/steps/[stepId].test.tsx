import { GetServerSidePropsContext } from "next"
import { mockForm } from "../../../../fixtures/form"
import { mockResident } from "../../../../fixtures/residents"
import {
  mockWorkflowWithExtras,
  mockWorkflow,
} from "../../../../fixtures/workflows"
import { ParsedUrlQuery } from "querystring"
import { getResidentById } from "../../../../lib/residents"
import { getServerSideProps } from "../../../../pages/reviews/[id]/steps/[stepId]"
import { allSteps } from "../../../../config/forms"
import { getSession } from "next-auth/client"
import { mockUser } from "../../../../fixtures/users"
import prisma from "../../../../lib/prisma"
import cookie from "cookie"
import jwt from "jsonwebtoken"
import { pilotGroup } from "../../../../config/allowedGroups"

const mockReassessment = {
  ...mockWorkflowWithExtras,
  type: "Reassessment",
}

jest.mock("../../../../lib/prisma", () => ({
  workflow: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
}))

jest.mock("../../../../lib/residents")
;(getResidentById as jest.Mock).mockResolvedValue(mockResident)

jest.mock("next-auth/client")
;(getSession as jest.Mock).mockResolvedValue({ user: mockUser })

jest.mock("../../../../lib/prisma", () => ({
  workflow: {
    findUnique: jest.fn(),
  },
}))

describe("getServerSideProps", () => {
  it("redirects back if user is not in pilot group", async () => {
    ;(prisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow)

    const response = await getServerSideProps({
      query: {
        id: mockWorkflow.id,
        stepId: mockForm.themes[0].steps[0].id,
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
    ;(prisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow)

    const response = await getServerSideProps({
      query: {
        id: mockWorkflow.id,
        stepId: mockForm.themes[0].steps[0].id,
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

  describe("when a workflow is in-progress", () => {
    beforeAll(() => {
      ;(prisma.workflow.findUnique as jest.Mock).mockResolvedValue(
        mockReassessment
      )
    })

    it("doesn't redirect", async () => {
      ;(getSession as jest.Mock).mockResolvedValue({ user: mockUser })

      const response = await getServerSideProps({
        query: {
          id: mockReassessment.id,
          stepId: mockForm.themes[0].steps[0].id,
        } as ParsedUrlQuery,
        req: {
          headers: {
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

      expect(response).toHaveProperty("props", {
        workflow: expect.objectContaining({
          id: mockReassessment.id,
          form: mockForm,
        }),
        allSteps: await allSteps(),
      })
    })
  })
})
