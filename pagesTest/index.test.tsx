import { mockResident } from "../fixtures/residents"
import { getResidentById } from "../lib/residents"
import KanbanPage, { getServerSideProps } from "../pages"
import { getSession } from "../lib/auth/session"
import { mockForm } from "../fixtures/form"
import {
  makeGetServerSidePropsContext, renderWithSession,
  testGetServerSidePropsAuthRedirect,
} from "../lib/auth/test-functions"
import {
  mockSession,
  mockSessionNotInPilot,
  mockSessionPanelApprover,
  mockSessionApprover,
} from "../fixtures/session"
import {screen, waitFor} from "@testing-library/react";
import {useRouter} from "next/router";
import {EventEmitter} from "events";

jest.mock("../lib/residents")
;(getResidentById as jest.Mock).mockResolvedValue(mockResident)
jest.mock("../lib/auth/session")
jest.mock("next/router");
;(useRouter as jest.Mock).mockReturnValue({events: new EventEmitter})

describe('<KanbanPage />', () => {
  it("displays all navigation links if the user is an approver", async () => {
   await waitFor(() => {
     renderWithSession(
       <KanbanPage forms={[mockForm]} />, mockSessionApprover
     );
   })

    expect(screen.getByText('Core pathway:')).toBeVisible();

    expect(screen.getByText('Teams Performance')).toBeVisible();
    expect(screen.getByText('Teams Performance').closest('a'))
      .toHaveAttribute('href', `/teams`);

    expect(screen.getByText('Users')).toBeVisible();
    expect(screen.getByText('Users').closest('a'))
      .toHaveAttribute('href', `/users`);
  });

  it("displays only displays the team performance link if the user is not a approver", async () => {
    await waitFor(() => {
      renderWithSession(
        <KanbanPage forms={[mockForm]} />
      );
    })

    expect(screen.getByText('Core pathway:')).toBeVisible();

    expect(screen.getByText('Teams Performance')).toBeVisible();
    expect(screen.getByText('Teams Performance').closest('a'))
      .toHaveAttribute('href', `/teams`);

    expect(screen.queryByText('Users')).not.toBeInTheDocument();
  });

});

describe("pages/index.getServerSideProps", () => {
  const context = makeGetServerSidePropsContext({})

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

  describe("when authenticated", () => {
    beforeAll(() => {
      ;(getSession as jest.Mock).mockResolvedValue(mockSession)
    })

    it("returns a list of workflows with forms as a prop", async () => {
      const response = await getServerSideProps(context)

      expect(response).toHaveProperty(
        "props",
        expect.objectContaining({
          forms: [mockForm],
        })
      )
    })
  })
})
