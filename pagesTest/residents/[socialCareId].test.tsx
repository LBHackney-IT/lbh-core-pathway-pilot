import { GetServerSidePropsContext } from "next"
import { mockForm } from "../../fixtures/form"
import { mockResident } from "../../fixtures/residents"
import { mockWorkflowWithExtras } from "../../fixtures/workflows"
import { ParsedUrlQuery } from "querystring"
import { getResidentById } from "../../lib/residents"
import ResidentWorkflowsPage, {
  getServerSideProps,
} from "../../pages/residents/[socialCareId]"
import {
  getLoginUrl,
  getSession,
  UserNotLoggedIn,
} from "../../lib/auth/session"
import { mockApprover } from "../../fixtures/users"
import { mockSession } from "../../fixtures/session"
import { makeGetServerSidePropsContext } from "../../lib/auth/test-functions"
import Layout from "../../components/_Layout"
import { useRouter } from "next/router"
import { render, screen } from "@testing-library/react"

jest.mock("../../lib/prisma", () => ({
  workflow: {
    findMany: jest.fn().mockResolvedValue([mockWorkflowWithExtras]),
  },
}))

jest.mock("../../lib/residents")
;(getResidentById as jest.Mock).mockResolvedValue(mockResident)

jest.mock("../../lib/auth/session")
;(getSession as jest.Mock).mockResolvedValue(mockSession)
;(getLoginUrl as jest.Mock).mockImplementation(
  (url = "") => `auth-server${url}`
)

jest.mock("next/router")
;(useRouter as jest.Mock).mockReturnValue({
  query: { socialCareId: mockResident.mosaicId },
})

jest.mock("../../components/_Layout")
;(Layout as jest.Mock).mockImplementation(({ children }) => <>{children}</>)

describe("pagesTest/residents/[socialCareId].getServerSideProps", () => {
  describe("when not authenticated", () => {
    beforeEach(() => {
      ;(getSession as jest.Mock).mockRejectedValueOnce(new UserNotLoggedIn())
    })

    it("returns a redirect to the auth server", async () => {
      const response = await getServerSideProps({
        query: {},
        req: {},
      } as GetServerSidePropsContext)

      expect(response).toHaveProperty(
        "redirect",
        expect.objectContaining({
          destination: "auth-server",
        })
      )
    })

    it("returns a redirect to the sign-in page that will redirect to another on login", async () => {
      const response = await getServerSideProps(
        makeGetServerSidePropsContext({
          resolvedUrl: "/some/random/page",
        })
      )

      expect(response).toHaveProperty(
        "redirect",
        expect.objectContaining({
          destination: "auth-server/some/random/page",
        })
      )
    })
  })

  describe("when authenticated", () => {
    beforeAll(() => {
      ;(getSession as jest.Mock).mockResolvedValue({ user: mockApprover })
    })

    it("returns a list of workflows with forms as a prop", async () => {
      const response = await getServerSideProps(
        makeGetServerSidePropsContext({
          query: { socialCareId: mockResident.mosaicId } as ParsedUrlQuery,
        })
      )

      expect(response).toHaveProperty(
        "props",
        expect.objectContaining({
          workflows: [
            expect.objectContaining({
              id: mockWorkflowWithExtras.id,
              form: mockForm,
            }),
          ],
        })
      )
    })

    it("returns the resident as a prop", async () => {
      const response = await getServerSideProps(
        makeGetServerSidePropsContext({
          query: { socialCareId: mockResident.mosaicId } as ParsedUrlQuery,
        })
      )

      expect(response).toHaveProperty(
        "props",
        expect.objectContaining({
          resident: mockResident,
        })
      )
    })
  })
})

describe("<ResidentWorkflowsPage />", () => {
  it("displays Workflows as the title of the page", () => {
    render(<ResidentWorkflowsPage workflows={[]} resident={mockResident} />)

    expect(
      screen.getByRole("heading", { level: 1, name: "Workflows" })
    ).toBeVisible()
  })

  describe("when the resident exists", () => {
    it("sets title to Workflows with resident name", () => {
      const layout = jest.fn(({ children }) => <>{children}</>)

      ;(Layout as jest.Mock).mockImplementation(layout)

      render(
        <ResidentWorkflowsPage
          workflows={[]}
          resident={{ ...mockResident, firstName: "Jane", lastName: "Doe" }}
        />
      )

      expect(layout).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Workflows | Jane Doe",
        }),
        expect.anything()
      )
    })

    it("sets text for link in breadcrumbs to resident page as resident name", () => {
      const layout = jest.fn(({ children }) => <>{children}</>)

      ;(Layout as jest.Mock).mockImplementation(layout)

      render(
        <ResidentWorkflowsPage
          workflows={[]}
          resident={{ ...mockResident, firstName: "Jane", lastName: "Doe" }}
        />
      )

      expect(layout).toHaveBeenCalledWith(
        expect.objectContaining({
          breadcrumbs: expect.arrayContaining([
            expect.objectContaining({
              text: "Jane Doe",
            }),
          ]),
        }),
        expect.anything()
      )
    })
  })

  describe("when the resident doesn't exist", () => {
    it("sets title to Workflows", () => {
      const layout = jest.fn(({ children }) => <>{children}</>)

      ;(Layout as jest.Mock).mockImplementation(layout)

      render(<ResidentWorkflowsPage workflows={[]} resident={null} />)

      expect(layout).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Workflows" }),
        expect.anything()
      )
    })

    it("sets text for link in breadcrumbs to resident page as social care ID", () => {
      const layout = jest.fn(({ children }) => <>{children}</>)

      ;(Layout as jest.Mock).mockImplementation(layout)

      render(<ResidentWorkflowsPage workflows={[]} resident={null} />)

      expect(layout).toHaveBeenCalledWith(
        expect.objectContaining({
          breadcrumbs: expect.arrayContaining([
            expect.objectContaining({
              text: "123",
            }),
          ]),
        }),
        expect.anything()
      )
    })
  })

  describe("when there are workflows", () => {
    it("displays each workflow", () => {
      render(
        <ResidentWorkflowsPage
          workflows={[
            { ...mockWorkflowWithExtras, id: "123abc" },
            { ...mockWorkflowWithExtras, id: "456def" },
          ]}
          resident={mockResident}
        />
      )

      expect(screen.getAllByRole("link", { name: "View" })[0]).toBeVisible()
      expect(screen.getAllByRole("link", { name: "View" })[1]).toBeVisible()
    })

    it("displays panel for unlinked reassessment", () => {
      render(
        <ResidentWorkflowsPage
          workflows={[mockWorkflowWithExtras]}
          resident={mockResident}
        />
      )

      expect(screen.getByText("Trying to start a reassessment?")).toBeVisible()
    })
  })

  describe("when there are no workflows", () => {
    it("displays there are no workflows for the resident", () => {
      render(<ResidentWorkflowsPage workflows={[]} resident={mockResident} />)

      expect(screen.getByText("This resident has no workflows.")).toBeVisible()
    })
  })
})
