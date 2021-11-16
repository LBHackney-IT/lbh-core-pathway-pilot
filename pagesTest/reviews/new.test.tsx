import { GetServerSidePropsContext } from "next"
import {
  mockAuthorisedWorkflowWithExtras,
  mockWorkflowWithExtras,
  MockWorkflowWithExtras,
} from "../../fixtures/workflows"
import { ParsedUrlQuery } from "querystring"
import { getServerSideProps, NewReviewPage } from "../../pages/reviews/new"
import cookie from "cookie"
import jwt from "jsonwebtoken"
import { pilotGroup } from "../../config/allowedGroups"
import { getSession } from "next-auth/client"
import { mockUser } from "../../fixtures/users"
import { useRouter } from "next/router"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { csrfFetch } from "../../lib/csrfToken"
import { mockResident } from "../../fixtures/residents"
import useResident from "../../hooks/useResident"
import Layout from "../../components/_Layout"

process.env.GSSO_TOKEN_NAME = "foo"
process.env.HACKNEY_JWT_SECRET = "secret"

jest.mock("../../components/_Layout")
;(Layout as jest.Mock).mockImplementation(({ children }) => <>{children}</>)

jest.mock("../../lib/prisma", () => ({
  workflow: {
    findUnique: jest
      .fn()
      .mockResolvedValue({ ...mockWorkflowWithExtras, nextReview: null }),
  },
}))

jest.mock("next-auth/client")
;(getSession as jest.Mock).mockResolvedValue({ user: mockUser })

jest.mock("next/router")

jest.mock("../../lib/csrfToken")
;(csrfFetch as jest.Mock).mockResolvedValue({
  json: jest.fn().mockResolvedValue({ id: "123abc" }),
})

jest.mock("../../hooks/useResident")
;(useResident as jest.Mock).mockReturnValue({ data: mockResident })

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

describe("<NewReviewPage />", () => {
  describe("when a previous workflow needs a reassessment", () => {
    const useRouterPush = jest.fn()

    beforeEach(() => {
      useRouterPush.mockClear()
      ;(csrfFetch as jest.Mock).mockClear()
      ;(useRouter as jest.Mock).mockReturnValue({
        query: {},
        push: useRouterPush,
      })
    })

    it("calls the new workflow API endpoint to create a reassessment", async () => {
      render(NewReviewPage(mockAuthorisedWorkflowWithExtras))

      fireEvent.click(screen.getByText("Planned"))
      fireEvent.change(
        screen.getByLabelText("When did the reassessment take place?"),
        { target: { value: "2021-11-16" } }
      )
      fireEvent.click(screen.getByText("In person"))
      fireEvent.click(screen.getByText("Continue to task list"))

      await waitFor(() => {
        expect(csrfFetch).toHaveBeenCalledWith(
          "/api/workflows",
          expect.objectContaining({
            method: "POST",
            body: JSON.stringify({
              formId: "mock-form",
              socialCareId: "123",
              workflowId: "123abc",
              type: "Reassessment",
              answers: {
                Reassessment: {
                  Type: "Planned",
                  "Other involved professionals": [],
                  "When did the reassessment take place?": "2021-11-16",
                  "How did the reassessment take place?": "In person",
                },
              },
            }),
          })
        )
      })
    })

    it("takes user to task list after submission", async () => {
      render(NewReviewPage(mockAuthorisedWorkflowWithExtras))

      fireEvent.click(screen.getByText("Planned"))
      fireEvent.change(
        screen.getByLabelText("When did the reassessment take place?"),
        { target: { value: "2021-11-16" } }
      )
      fireEvent.click(screen.getByText("In person"))
      fireEvent.click(screen.getByText("Continue to task list"))

      await waitFor(() => {
        expect(useRouterPush).toHaveBeenCalledWith("/workflows/123abc/steps")
      })
    })
  })

  describe("when an unlinked reassessment", () => {
    const unlinkedReassessment: MockWorkflowWithExtras = {
      ...mockWorkflowWithExtras,
      socialCareId: mockResident.mosaicId,
      type: "Reassessment",
      linkToOriginal: "http://example.com",
    }

    const useRouterPush = jest.fn()

    beforeEach(() => {
      useRouterPush.mockClear()
      ;(csrfFetch as jest.Mock).mockClear()
      ;(useRouter as jest.Mock).mockReturnValue({
        query: { unlinked_reassessment: "true" },
        push: useRouterPush,
      })
    })

    it("calls the update workflow API endpoint to update answers", async () => {
      render(NewReviewPage(unlinkedReassessment))

      fireEvent.click(screen.getByText("Planned"))
      fireEvent.change(
        screen.getByLabelText("When did the reassessment take place?"),
        { target: { value: "2021-11-16" } }
      )
      fireEvent.click(screen.getByText("In person"))
      fireEvent.click(screen.getByText("Continue to task list"))

      await waitFor(() => {
        expect(csrfFetch).toHaveBeenCalledWith(
          "/api/workflows/123abc",
          expect.objectContaining({
            method: "PATCH",
            body: JSON.stringify({
              answers: {
                Reassessment: {
                  Type: "Planned",
                  "Other involved professionals": [],
                  "When did the reassessment take place?": "2021-11-16",
                  "How did the reassessment take place?": "In person",
                },
              },
            }),
          })
        )
      })
    })

    it("takes user to task list after submission", async () => {
      render(NewReviewPage(unlinkedReassessment))

      fireEvent.click(screen.getByText("Planned"))
      fireEvent.change(
        screen.getByLabelText("When did the reassessment take place?"),
        { target: { value: "2021-11-16" } }
      )
      fireEvent.click(screen.getByText("In person"))
      fireEvent.click(screen.getByText("Continue to task list"))

      await waitFor(() => {
        expect(useRouterPush).toHaveBeenCalledWith("/workflows/123abc/steps")
      })
    })
  })
})
