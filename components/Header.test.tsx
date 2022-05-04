import {render, screen} from "@testing-library/react"
import {renderWithSession} from "../lib/auth/test-functions";
import Header from "./Header"

describe("Header", () => {
  describe('when authenticated as a user', function () {
    beforeEach(() => renderWithSession(<Header/>))

    it('shows a link to the teams allocation page on the main social care app', () => {
      expect(screen.getByText('Teams').closest('a'))
        .toHaveAttribute('href', `${process.env.NEXT_PUBLIC_SOCIAL_CARE_APP_URL}/teams`);
    });

    it('shows a link to the my work page on the main social care app', () => {
      expect(screen.getByText('My work').closest('a'))
        .toHaveAttribute('href', `${process.env.NEXT_PUBLIC_SOCIAL_CARE_APP_URL}`);
    });

    it('shows a link to the search page on the main social care app', () => {
      expect(screen.getByText('Search').closest('a'))
        .toHaveAttribute('href', `${process.env.NEXT_PUBLIC_SOCIAL_CARE_APP_URL}/search`);
    });

    it('shows a link to the planner page', () => {
      expect(screen.getByText('Workflows').closest('a'))
        .toHaveAttribute('href', `/`);
    });

    it('shows a link to let a user logout the app', () => {
      expect(screen.getByText('Sign out').closest('a'))
        .toHaveAttribute('href', `${process.env.NEXT_PUBLIC_SOCIAL_CARE_APP_URL}/logout`);
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
