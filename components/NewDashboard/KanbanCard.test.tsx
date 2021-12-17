import {describe, test} from "@jest/globals";
import {screen} from "@testing-library/react";
import {
  mockWorkflowWithExtras
} from "../../fixtures/workflows";
import {Status} from "../../types";
import KanbanCard from "./KanbanCard";
import {renderWithSession} from "../../lib/auth/test-functions";
import useResident from "../../hooks/useResident";
import {mockResident} from "../../fixtures/residents";

jest.mock('../../hooks/useResident');
(useResident as jest.Mock).mockReturnValue({
  data: mockResident,
})

describe("components/NewDashboard/KanbanCard", () => {
  describe('an in-progress status', () => {
    beforeEach(() =>
      renderWithSession(<KanbanCard workflow={mockWorkflowWithExtras} status={Status.InProgress}/>)
    );

    test('displays a link to the workflow', () => {
      expect(screen.getByText('Resident Firstname Resident Surname').closest('a'))
        .toHaveAttribute('href', `/workflows/${mockWorkflowWithExtras.id}`);
    });

    test('displays the residents name', () => {
      expect(screen.getByText('Resident Firstname Resident Surname')).toBeVisible();
    });

    test('displays the workflow form type', () => {
      expect(screen.getByText(/Mock form/)).toBeVisible();
    });
  });
})
