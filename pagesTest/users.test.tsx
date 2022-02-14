import UsersPage, {getServerSideProps} from "../pages/users"
import {getSession} from "../lib/auth/session"
import {mockUser} from "../fixtures/users"
import prisma from "../lib/prisma"
import {fireEvent, screen, waitFor, within} from "@testing-library/react"
import {
  mockSession,
  mockSessionNotInPilot,
  mockSessionPanelApprover,
  mockSessionApprover,
} from "../fixtures/session"
import {
  makeGetServerSidePropsContext, renderWithSession,
  testGetServerSidePropsAuthRedirect,
} from "../lib/auth/test-functions"
import {csrfFetch} from "../lib/csrfToken";
import {FlashMessageProvider} from "../contexts/flashMessages";
import {useRouter} from "next/router";
import {EventEmitter} from "events";

jest.mock("../lib/prisma", () => ({
  user: {
    findMany: jest.fn(),
  },
}))
;(prisma.user.findMany as jest.Mock).mockResolvedValue([mockUser])

jest.mock("../lib/auth/session")
;(getSession as jest.Mock).mockResolvedValue(mockSession)

jest.mock("../lib/csrfToken")
;(csrfFetch as jest.Mock).mockResolvedValue({ok: true});

jest.mock("next/router");
;(useRouter as jest.Mock).mockReturnValue({events: new EventEmitter})

const getRowContext = (term: string) => {
  const {getByText: getByTextWithinMain} = within(screen.getByRole('main'))
  const {getByRole: getByRoleWithinRow, getAllByRole: getAllByRoleWithinRow} = within(getByTextWithinMain(term).closest("tr"))

  return {getByRoleWithinRow, getAllByRoleWithinRow};
}

describe('<UsersPage />', () => {
  beforeEach(() => {
    renderWithSession(
      <FlashMessageProvider>
        <UsersPage users={[mockUser, {...mockUser, id: 'abc123', email: 'test@example.com', name: 'Bob'}]}/>
      </FlashMessageProvider>,
      mockSessionApprover,
    );
  });

  describe('updating a users team', () => {
    beforeEach(async () => {
      const {getByRoleWithinRow} = getRowContext('Bob')
      await waitFor(() => {
        fireEvent.change(getByRoleWithinRow('combobox'), {target: {value: 'DirectPayments'}})
      });
    });
    test('only updates the changed user', () => {
      expect(csrfFetch).toHaveBeenCalledWith("/api/users", {
        body: JSON.stringify({
          abc123: {
            email: "test@example.com",
            team: "DirectPayments",
            approver: false,
            panelApprover: false,
          }
        }),
        method: "PATCH"
      })
    });
  });

  describe('setting a user as an approver', () => {
    beforeEach(async () => {
      const {getAllByRoleWithinRow} = getRowContext('Bob')
      await waitFor(() => {
        fireEvent.click(getAllByRoleWithinRow('checkbox')[0])
      });
    });
    test('only updates the changed user', () => {
      expect(csrfFetch).toHaveBeenCalledWith("/api/users", {
        body: JSON.stringify({
          abc123: {
            email: "test@example.com",
            team: "Access",
            approver: true,
            panelApprover: false,
          }
        }),
        method: "PATCH"
      })
    });
  });
});

describe("pages/users.getServerSideProps", () => {
  const context = makeGetServerSidePropsContext({})

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
        redirect: true,
        context,
      },
    ],
  })

  describe("when logged in as an approver", () => {
    beforeEach(() => {
      ;(getSession as jest.Mock).mockResolvedValue(mockSessionApprover)
    })

    it("filters historic users", async () => {
      await getServerSideProps(context)

      expect(prisma.user.findMany).toBeCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            historic: false,
          }),
        })
      )
    })

    it("orders users by team and then approvers", async () => {
      await getServerSideProps(context)

      expect(prisma.user.findMany).toBeCalledWith(
        expect.objectContaining({
          orderBy: expect.arrayContaining([
            { team: "asc" },
            { panelApprover: "desc" },
            { approver: "desc" },
            { name: "asc" },
          ]),
        })
      )
    })

    it("includes the last time each user was seen", async () => {
      const response = await getServerSideProps(context)

      expect(response).toHaveProperty("props", {
        users: expect.arrayContaining([
          expect.objectContaining({
            lastSeenAt: "2020-10-13T13:15:00.000Z",
          }),
        ]),
      })
    })
  })
})
