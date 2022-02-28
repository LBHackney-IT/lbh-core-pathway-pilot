import { mockForm } from "../../../fixtures/form"
import { mockResident } from "../../../fixtures/residents"
import { mockWorkflowWithExtras } from "../../../fixtures/workflows"
import { getResidentById } from "../../../lib/residents"
import WorkflowPage, { getServerSideProps } from "../../../pages/workflows/[id]"
import { getSession } from "../../../lib/auth/session"
import { fireEvent, render, screen } from "@testing-library/react"
import {
  mockSession,
  mockSessionNotInPilot,
  mockSessionPanelApprover,
  mockSessionApprover,
} from "../../../fixtures/session"
import {
  makeGetServerSidePropsContext,
  testGetServerSidePropsAuthRedirect,
} from "../../../lib/auth/test-functions"
import { useRouter } from "next/router"
import useAnswerFilters from "../../../hooks/useAnswerFilters"
import { mockAnswerFilter } from "../../../fixtures/answerFilter"
import useNextSteps from "../../../hooks/useNextSteps"
import { mockNextStepOptions } from "../../../fixtures/nextStepOptions"

jest.mock("next/router")
;(useRouter as jest.Mock).mockReturnValue({
  push: jest.fn(),
  replace: jest.fn(),
})

jest.mock("../../../lib/prisma", () => ({
  workflow: {
    findUnique: jest.fn().mockResolvedValue(mockWorkflowWithExtras),
  },
}))

jest.mock("../../../lib/residents")
;(getResidentById as jest.Mock).mockResolvedValue(mockResident)

jest.mock("../../../lib/auth/session")
;(getSession as jest.Mock).mockResolvedValue(mockSession)

jest.mock("../../../hooks/useAnswerFilters")

const mockFilters = {
  answerFilters: mockAnswerFilter,
}

;(useAnswerFilters as jest.Mock).mockReturnValue({ data: mockFilters })

jest.mock("../../../hooks/useNextSteps")
const mockNextSteps = {
    options: mockNextStepOptions
  }
;(useNextSteps as jest.Mock).mockReturnValue({ data: mockNextSteps })

describe("pages/workflows/[id].getServerSideProps", () => {
  const context = makeGetServerSidePropsContext({
    query: {
      social_care_id: mockResident.mosaicId,
    },
  })

  testGetServerSidePropsAuthRedirect({
    getServerSideProps,
    tests: [
      {
        name: "user is not in pilot group",
        session: mockSessionNotInPilot,
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

  it("returns the workflow and form as props", async () => {
    const response = await getServerSideProps(context)

    expect(response).toHaveProperty(
      "props.workflow",
      expect.objectContaining({
        id: mockWorkflowWithExtras.id,
        form: mockForm,
      })
    )
  })
})
describe("<WorkflowPage/>", () => {
  describe("When using the answer filters", function () {
    const currentworkflow = {
      ...mockWorkflowWithExtras,
      comments: [],
      answers: {
        "step foo": {
          "question one?": "answer one",
          "question two?": "answer two",
        },
        "step bar": {
          "question three?": "answer three",
          "question four?": "answer four",
        },
      },
    }

    beforeEach(async () => {
      render(<WorkflowPage workflow={currentworkflow} forms={[mockForm]} />)
    })

    it("displays everything when no filter is applied", function () {
      expect(screen.getAllByTestId("question").length).toBe(4)
    })

    it("hides irrelevant answers when filtered by team", function () {
      fireEvent.click(screen.getByText("Direct payments"))
      expect(screen.getAllByTestId("question").length).toBe(1)
    })

    // 'Relevency' is dictated by Contentful - each field can have the teams it's relevant to
    // tagged when setting up a field and this is imported into  config/answersFilter.json
    it("always shows answers that are relevant to both teams", function () {
      fireEvent.click(screen.getByText("Direct payments"))
      expect(screen.getAllByTestId("question").length).toBe(1)
      expect(screen.getByText("question one?"))

      fireEvent.click(screen.getByText("Brokerage"))
      expect(screen.getAllByTestId("question").length).toBe(3)
      expect(screen.getByText("question one?"))
    })
  })
})
