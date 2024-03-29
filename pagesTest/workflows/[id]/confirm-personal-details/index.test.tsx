import { render, screen, waitFor, within } from "@testing-library/react"
import { mockResident } from "../../../../fixtures/residents"
import {
  mockWorkflow,
  mockAuthorisedWorkflow,
} from "../../../../fixtures/workflows"
import { ParsedUrlQuery } from "querystring"
import { getResidentById } from "../../../../lib/residents"
import prisma from "../../../../lib/prisma"
import { useRouter } from "next/router"
import {
  getServerSideProps,
  ConfirmPersonalDetails,
} from "../../../../pages/workflows/[id]/confirm-personal-details"
import { FlashMessages } from "../../../../contexts/flashMessages"
import { Workflow } from "@prisma/client"
import { getSession } from "../../../../lib/auth/session"
import {
  mockSession,
  mockSessionNotInPilot,
  mockSessionPanelApprover,
  mockSessionApprover,
} from "../../../../fixtures/session"
import {
  makeGetServerSidePropsContext,
  testGetServerSidePropsAuthRedirect,
} from "../../../../lib/auth/test-functions"
import useForms from "../../../../hooks/useForms"
import { mockForm } from "../../../../fixtures/form"
import useFullResident from "../../../../hooks/useFullResident"
import { mockFullResident } from "../../../../fixtures/fullResidents"

jest.mock("../../../../contexts/flashMessages")
;(FlashMessages as jest.Mock).mockReturnValue(<></>)

jest.mock("next/router")

jest.mock("../../../../lib/auth/session")
;(getSession as jest.Mock).mockResolvedValue(mockSession)

jest.mock("../../../../hooks/useForms")
;(useForms as jest.Mock).mockResolvedValue(mockForm)

jest.mock("../../../../lib/prisma", () => ({
  workflow: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
}))

jest.mock("../../../../lib/residents")

jest.mock("../../../../hooks/useFullResident")

global.fetch = jest.fn().mockResolvedValue({ json: jest.fn() })

describe("<ConfirmPersonalDetails />", () => {
  ;(useFullResident as jest.Mock).mockReturnValue({
    data: mockFullResident,
  })
  describe("when the workflow is new", () => {
    beforeEach(() => {
      ;(useRouter as jest.Mock).mockReturnValue({
        query: { id: mockWorkflow.id },
      })
    })

    it("displays link to resident page in social care app in breadcrumbs", async () => {
      await waitFor(() =>
        render(
          <ConfirmPersonalDetails
            resident={mockResident}
            workflow={mockWorkflow}
          />
        )
      )

      const breadcrumbs = within(screen.getByTestId("breadcrumbs"))
      const residentLink = breadcrumbs.getByText(
        `${mockResident.firstName} ${mockResident.lastName}`
      )

      expect(residentLink).toBeVisible()
      expect(residentLink).toHaveAttribute(
        "href",
        `${process.env.NEXT_PUBLIC_SOCIAL_CARE_APP_URL}/residents/${mockResident.mosaicId}`
      )
    })

    it("displays current page as check details in breadcrumbs", async () => {
      await waitFor(() =>
        render(
          <ConfirmPersonalDetails
            resident={mockResident}
            workflow={mockWorkflow}
          />
        )
      )

      const breadcrumbs = within(screen.getByTestId("breadcrumbs"))

      expect(breadcrumbs.getByText("Check details")).toBeVisible()
    })

    it("displays the details of the resident", async () => {
      await waitFor(() =>
        render(
          <ConfirmPersonalDetails
            resident={mockResident}
            workflow={mockWorkflow}
          />
        )
      )

      const warningPanel = within(screen.getByRole("heading", {level: 1}).closest("div"))

      expect(warningPanel.getByText("Social care ID")).toBeVisible()
      expect(warningPanel.getByText(mockResident.mosaicId)).toBeVisible()
    })

    it("displays link to task list", async () => {
      await waitFor(() =>
        render(
          <ConfirmPersonalDetails
            resident={mockResident}
            workflow={mockWorkflow}
          />
        )
      )

      const yesLink = screen.getByText("Yes, they are correct")

      expect(yesLink).toBeVisible()
      expect(yesLink).toHaveAttribute(
        "href",
        `/workflows/${mockWorkflow.id}/steps`
      )
    })

    it("displays link to amend resident details", async () => {
      await waitFor(() =>
        render(
          <ConfirmPersonalDetails
            resident={mockResident}
            workflow={mockWorkflow}
          />
        )
      )

      const noLink = screen.getByText("No, they need to be updated")

      expect(noLink).toBeVisible()

      expect(noLink.getAttribute("href")).toContain(
        "/residents/123?redirectUrl=http://localhost/workflows/123abc"
      )
    })

    it("displays text to confirm personal details before starting a workflow", async () => {
      await waitFor(() =>
        render(
          <ConfirmPersonalDetails
            resident={mockResident}
            workflow={mockWorkflow}
          />
        )
      )

      expect(
        screen.getByText(
          "You need to confirm these before starting a workflow."
        )
      ).toBeVisible()
    })
  })

  describe("when the workflow needs a resassessment", () => {
    beforeEach(() => {
      ;(useRouter as jest.Mock).mockReturnValue({
        query: { id: mockAuthorisedWorkflow.id },
      })

      render(
        <ConfirmPersonalDetails
          resident={mockResident}
          workflow={mockAuthorisedWorkflow}
        />
      )
    })

    it("displays link to resident page in social care app in breadcrumbs", async () => {
      const breadcrumbs = within(screen.getByTestId("breadcrumbs"))
      const residentLink = breadcrumbs.getByText(
        `${mockResident.firstName} ${mockResident.lastName}`
      )

      expect(residentLink).toBeVisible()
      expect(residentLink).toHaveAttribute(
        "href",
        `${process.env.NEXT_PUBLIC_SOCIAL_CARE_APP_URL}/residents/${mockResident.mosaicId}`
      )
    })

    it("displays current page as a check details in breadcrumbs", async () => {
      const breadcrumbs = within(screen.getByTestId("breadcrumbs"))

      expect(breadcrumbs.getByText("Check details")).toBeVisible()
    })

    it("displays the details of the resident", async () => {
      const warningPanel = within(screen.getByRole("heading", {level: 1}).closest("div"))

      expect(warningPanel.getByText("Social care ID")).toBeVisible()
      expect(warningPanel.getByText(mockResident.mosaicId)).toBeVisible()
    })

    it("displays link to amend resident details", async () => {
      const noLink = screen.getByText("No, they need to be updated")

      expect(noLink).toBeVisible()
      expect(noLink.getAttribute("href")).toContain(
        "/residents/123?redirectUrl=http://localhost/workflows/123abc"
      )
    })

    it("displays text to confirm personal details before reassessment", async () => {
      expect(
        screen.getByText(
          "You need to confirm these before reassessing a workflow."
        )
      ).toBeVisible()
    })
  })

  describe("when the workflow is an unlinked reassessment", () => {
    const unlinkedReassessment: Workflow = {
      ...mockWorkflow,
      socialCareId: mockResident.mosaicId,
      type: "Reassessment",
      linkToOriginal: "http://example.com",
    }

    beforeEach(() => {
      ;(useRouter as jest.Mock).mockReturnValue({
        query: { id: unlinkedReassessment.id, unlinked_reassessment: "true" },
      })
    })

    it("displays link to resident page in social care app in breadcrumbs", async () => {
      await waitFor(() =>
        render(
          <ConfirmPersonalDetails
            resident={mockResident}
            workflow={unlinkedReassessment}
          />
        )
      )

      const breadcrumbs = within(screen.getByTestId("breadcrumbs"))
      const residentLink = breadcrumbs.getByText(
        `${mockResident.firstName} ${mockResident.lastName}`
      )

      expect(residentLink).toBeVisible()
      expect(residentLink).toHaveAttribute(
        "href",
        `${process.env.NEXT_PUBLIC_SOCIAL_CARE_APP_URL}/residents/${mockResident.mosaicId}`
      )
    })

    it("doesn't display link to workflow in breadcrumbs", async () => {
      await waitFor(() =>
        render(
          <ConfirmPersonalDetails
            resident={mockResident}
            workflow={unlinkedReassessment}
          />
        )
      )

      const breadcrumbs = within(screen.getByTestId("breadcrumbs"))

      expect(breadcrumbs.queryByText("Workflow")).not.toBeInTheDocument()
    })

    it("displays current page as a check details in breadcrumbs", async () => {
      await waitFor(() =>
        render(
          <ConfirmPersonalDetails
            resident={mockResident}
            workflow={unlinkedReassessment}
          />
        )
      )

      const breadcrumbs = within(screen.getByTestId("breadcrumbs"))

      expect(breadcrumbs.getByText("Check details")).toBeVisible()
    })

    it("displays the details of the resident", async () => {
      await waitFor(() =>
        render(
          <ConfirmPersonalDetails
            resident={mockResident}
            workflow={unlinkedReassessment}
          />
        )
      )

      const warningPanel = within(screen.getByRole("heading", {level: 1}).closest("div"))

      expect(warningPanel.getByText("Social care ID")).toBeVisible()
      expect(warningPanel.getByText(mockResident.mosaicId)).toBeVisible()
    })

    it("displays link to a new reassessment with unlinked_reassessment query param", async () => {
      await waitFor(() =>
        render(
          <ConfirmPersonalDetails
            resident={mockResident}
            workflow={unlinkedReassessment}
          />
        )
      )

      const yesLink = screen.getByText("Yes, they are correct")

      expect(yesLink).toBeVisible()
      expect(yesLink).toHaveAttribute(
        "href",
        `/workflows/${unlinkedReassessment.id}/steps`
      )
    })

    it("displays link to amend resident details", async () => {
      await waitFor(() =>
        render(
          <ConfirmPersonalDetails
            resident={mockResident}
            workflow={unlinkedReassessment}
          />
        )
      )

      const noLink = screen.getByText("No, they need to be updated")

      expect(noLink).toBeVisible()
      expect(noLink.getAttribute("href")).toContain(
        "/residents/123?redirectUrl=http://localhost/workflows/123abc"
      )
    })

    it("displays text to confirm personal details before reassessment", async () => {
      await waitFor(() =>
        render(
          <ConfirmPersonalDetails
            resident={mockResident}
            workflow={unlinkedReassessment}
          />
        )
      )

      expect(
        screen.getByText(
          "You need to confirm these before reassessing a workflow."
        )
      ).toBeVisible()
    })
  })
})

describe("pages/workflows/[id]/confirm-personal-details.getServerSideProps", () => {
  beforeEach(() => {
    ;(prisma.workflow.findUnique as jest.Mock).mockClear()
    ;(prisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow)
    ;(getResidentById as jest.Mock).mockClear()
    ;(getResidentById as jest.Mock).mockResolvedValue(mockResident)
  })

  const context = makeGetServerSidePropsContext({
    query: { id: mockWorkflow.id } as ParsedUrlQuery,
  })

  testGetServerSidePropsAuthRedirect({
    getServerSideProps,
    tests: [
      {
        name: "user is not in pilot group",
        session: mockSessionNotInPilot,
        redirect: true,
        context,
      },
      {
        name: "user is only an approver",
        session: mockSessionApprover,
        context,
      },
      {
        name: "user is only a panel approver",
        session: mockSessionPanelApprover,
        context,
      },
    ],
  })

  it("returns 404 if workflow doesn't exist", async () => {
    ;(prisma.workflow.findUnique as jest.Mock).mockResolvedValue(null)

    const response = await getServerSideProps(context)

    expect(response).toHaveProperty("redirect", { destination: "/404" })
  })

  it("returns the resident as props", async () => {
    const response = await getServerSideProps(
      makeGetServerSidePropsContext(context)
    )

    expect(response).toHaveProperty(
      "props",
      expect.objectContaining({ resident: mockResident })
    )
  })

  it("returns the workflow as JSON in props", async () => {
    const response = await getServerSideProps(
      makeGetServerSidePropsContext(context)
    )

    expect(response).toHaveProperty(
      "props",
      expect.objectContaining({
        workflow: JSON.parse(JSON.stringify(mockWorkflow)),
      })
    )
  })
})
