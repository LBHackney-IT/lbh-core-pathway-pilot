import { GetServerSidePropsContext } from "next"
import { mockForm } from "../../fixtures/form"
import { mockResident } from "../../fixtures/residents"
import { mockWorkflowWithExtras } from "../../fixtures/workflows"
import { ParsedUrlQuery } from "querystring"
import { getResidentById } from "../../lib/residents"
import NewWorkflowPage, { getServerSideProps } from "../../pages/workflows/new"
import cookie from "cookie"
import jwt from "jsonwebtoken"
import { pilotGroup } from "../../config/allowedGroups"
import { getSession } from "next-auth/client"
import { mockUser } from "../../fixtures/users"
import { useRouter } from "next/router"
import { render, screen } from "@testing-library/react"
import Layout from "../../components/_Layout"
import { screeningFormId } from "../../config"

process.env.GSSO_TOKEN_NAME = "foo"
process.env.HACKNEY_JWT_SECRET = "secret"

jest.mock("../../lib/prisma", () => ({
  workflow: {
    findUnique: jest.fn().mockResolvedValue(mockWorkflowWithExtras),
    update: jest.fn(),
  },
}))

jest.mock("../../lib/residents")
;(getResidentById as jest.Mock).mockResolvedValue(mockResident)

jest.mock("next-auth/client")
;(getSession as jest.Mock).mockResolvedValue({ user: mockUser })

jest.mock("next/router")

jest.mock("../../components/_Layout")
;(Layout as jest.Mock).mockImplementation(({ children }) => <>{children}</>)

describe("getServerSideProps", () => {
  it("returns the resident and forms as props", async () => {
    const response = await getServerSideProps({
      query: {
        social_care_id: mockResident.mosaicId,
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
        resident: mockResident,
        forms: [mockForm],
      })
    )
  })

  it("redirects back if user is not in pilot group", async () => {
    const response = await getServerSideProps({
      query: {
        social_care_id: mockResident.mosaicId,
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
        social_care_id: mockResident.mosaicId,
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

describe("<NewWorkflowPage />", () => {
  const forms = [
    mockForm,
    { ...mockForm, id: screeningFormId, name: "Screening assessment" },
  ]

  describe("when an unlinked reassessment", () => {
    beforeEach(() => {
      ;(useRouter as jest.Mock).mockReturnValue({
        query: { unlinked_reassessment: "true" },
      })
    })

    it("displays reassessment as the main heading", async () => {
      render(<NewWorkflowPage resident={mockResident} forms={forms} />)

      expect(
        screen.getByText("What kind of reassessment is this?")
      ).toBeVisible()
    })

    it("displays form type options without screening assessment", async () => {
      render(<NewWorkflowPage resident={mockResident} forms={forms} />)

      expect(screen.getByText("Mock form")).toBeVisible()
      expect(screen.queryByText("Screening assessment")).toBeNull()
    })

    it("displays warning about creating an unlinked reassessment", async () => {
      render(<NewWorkflowPage resident={mockResident} forms={forms} />)

      expect(
        screen.getByText(
          "You're about to create a reassessment that isn't linked to an existing workflow."
        )
      ).toBeVisible()
      expect(
        screen.getByText(
          "Only continue if you're sure the previous workflow exists but hasn't been imported."
        )
      ).toBeVisible()
    })

    it("asks where the previous workflow is ", async () => {
      render(<NewWorkflowPage resident={mockResident} forms={forms} />)

      expect(screen.getByText("Where is the previous workflow?")).toBeVisible()
    })
  })

  describe("when a new assessment", () => {
    beforeEach(() => {
      ;(useRouter as jest.Mock).mockReturnValue({
        query: {},
      })
    })

    it("displays assessment as the main heading", async () => {
      render(<NewWorkflowPage resident={mockResident} forms={forms} />)

      expect(screen.getByText("What kind of assessment is this?")).toBeVisible()
    })

    it("displays all form type options", async () => {
      render(<NewWorkflowPage resident={mockResident} forms={forms} />)

      expect(screen.getByText("Mock form")).toBeVisible()
      expect(screen.getByText("Screening assessment")).toBeVisible()
    })

    it("doesn't display warning about creating an unlinked reassessment", async () => {
      render(<NewWorkflowPage resident={mockResident} forms={forms} />)

      expect(
        screen.queryByText(
          "You're about to create a reassessment that isn't linked to an existing workflow."
        )
      ).toBeNull()
      expect(
        screen.queryByText(
          "Only continue if you're sure the previous workflow exists but hasn't been imported."
        )
      ).toBeNull()
    })

    it("doesn't ask where the previous workflow is ", async () => {
      render(<NewWorkflowPage resident={mockResident} forms={forms} />)

      expect(
        screen.queryByText("Where is the previous workflow?")
      ).toBeNull()
    })
  })
})
