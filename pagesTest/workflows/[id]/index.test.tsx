import { mockForm } from "../../../fixtures/form"
import { mockResident } from "../../../fixtures/residents"
import { mockWorkflowWithExtras } from "../../../fixtures/workflows"
import { getResidentById } from "../../../lib/residents"
import WorkflowPage, { getServerSideProps } from "../../../pages/workflows/[id]"
import { getSession } from "../../../lib/auth/session"
import { render, screen } from "@testing-library/react"
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

jest.mock("../../../lib/prisma", () => ({
  workflow: {
    findUnique: jest.fn().mockResolvedValue(mockWorkflowWithExtras),
  },
}))

jest.mock("../../../lib/residents")
;(getResidentById as jest.Mock).mockResolvedValue(mockResident)

jest.mock("../../../lib/auth/session")
;(getSession as jest.Mock).mockResolvedValue(mockSession)

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
  describe('When using the brokerage filter', function () {
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
        }
      }
    }


    beforeEach( async () => {
        render(<WorkflowPage workflow={currentworkflow} forms={[mockForm]} />)
      }
    )

    it('Displays everything when no filter is applied', function () {
      // expect(screen.getByText("Immediate Services"))
      expect(screen.getAllByTestId("Question")).toBe(4)

    });

    it('Hides irrelevant answers when filtered by team', function () {

    });

    // 'Relevency' is dictated by Contentful - each field can have the teams it's relevant to
    // tagged when setting up a field and this is imported into  config/answersFilter.json
    it('Always shows answers that are relevant to both teams', function () {

    });

  });
})
