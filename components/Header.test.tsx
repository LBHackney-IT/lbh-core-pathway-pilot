import {render, screen} from "@testing-library/react"
import {renderWithSession} from "../lib/auth/test-functions";
import Header from "./Header"
import {mockSession} from "../fixtures/session";

describe("Header", () => {
  describe('when authenticated as a user', function () {
    beforeEach(() => renderWithSession(<Header/>))

    it("shows the users full name", () => {
      expect(screen.getByText("Firstname Surname"));
    });
    it('does not show the users link', () => {
      expect(screen.queryByText("Users")).toBeNull();
    });
    it('shows a link to the users team', () => {
      expect(screen.getByText('My team').closest('a'))
        .toHaveAttribute('href', `/teams/${mockSession.team.toLowerCase()}`);
    });

    describe('when the user does not have a full name', () => {
      beforeEach(() =>
        renderWithSession(<Header/>, {...mockSession, name: undefined})
      );

      it("shows the users email address", () => {
        expect(screen.getByText("firstname.surname@hackney.gov.uk"));
      });
    });

    describe('when the user is not in a team', function () {
      beforeEach(() => renderWithSession(<Header/>, {...mockSession, team: null }))

      it("has a link to all teams", () => {
        expect(screen.getByText('Teams').closest('a'))
          .toHaveAttribute('href', '/teams');
      });
    });
  });

  describe('header layout', () => {
    it("supports regular layout", () => {
      render(<Header/>)
      expect(screen.getByTestId("full-width-container")).not.toHaveClass(
        "lmf-full-width"
      )
    })

    it("supports full-width layout", () => {
      render(<Header fullWidth/>)
      expect(screen.getByTestId("full-width-container")).toHaveClass(
        "lmf-full-width"
      )
    })
  });
})
