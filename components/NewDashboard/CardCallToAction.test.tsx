import {describe, test} from "@jest/globals";
import {render, screen} from "@testing-library/react";
import CardCallToAction from "./CardCallToAction";
import {
  mockManagerApprovedWorkflowWithExtras,
  mockSubmittedWorkflowWithExtras,
  mockWorkflowWithExtras
} from "../../fixtures/workflows";
import {Status} from "../../types";

describe("components/NewDashboard/CardCallToAction", () => {
  describe('an in-progress status', () => {
    beforeEach(() =>
      render(<CardCallToAction workflow={mockWorkflowWithExtras} status={Status.InProgress}/>));
    test('displays the workflows completeness', () => {
      expect(screen.getByText('0% complete')).toBeVisible();
    });
  });

  describe('a submitted status', () => {
    describe('when the workflow has been waiting less than one day', () => {
      beforeEach(() =>
        render(<CardCallToAction workflow={mockSubmittedWorkflowWithExtras} status={Status.Submitted}/>));

      test('nothing is rendered', () => {
        expect(screen.queryByText('Waiting')).toBeNull();
      });
    });

    describe('when the workflow has been waiting one day', () => {
      beforeEach(() => {
        const submittedAt = new Date();
        submittedAt.setDate(submittedAt.getDate() - 1);

        render(<CardCallToAction workflow={{
          ...mockSubmittedWorkflowWithExtras,
          submittedAt,
        }} status={Status.Submitted} />);
      });

      test('shows the number of days the workflow has been waiting', () => {
        expect(screen.getByText('Waiting 1 day')).toBeVisible();
      });
    });

    describe('when the workflow has been waiting more than one day', () => {
      beforeEach(() => {
        const submittedAt = new Date();
        submittedAt.setDate(submittedAt.getDate() - 2);

        render(<CardCallToAction workflow={{
          ...mockSubmittedWorkflowWithExtras,
          submittedAt,
        }} status={Status.Submitted} />);
      });

      test('shows the number of days the workflow has been waiting', () => {
        expect(screen.getByText('Waiting 2 days')).toBeVisible();
      });
    });
  });

  describe('a manager approved status', () => {
    describe('when the workflow has just been approved', () => {
      beforeEach(() => {
        render(<CardCallToAction workflow={mockManagerApprovedWorkflowWithExtras} status={Status.ManagerApproved} />);
      });

      test('does not render a call to action', () => {
        expect(screen.queryByText('Waiting')).toBeNull();
      });
    });

    describe('when the workflow has been waiting one day', () => {
      beforeEach(() => {
        const managerApprovedAt = new Date();
        managerApprovedAt.setDate(managerApprovedAt.getDate() - 1);

        render(<CardCallToAction workflow={{
          ...mockManagerApprovedWorkflowWithExtras,
          managerApprovedAt,
        }} status={Status.ManagerApproved} />);
      });

      test('shows the workflow has been waiting one day', () => {
        expect(screen.getByText('Waiting 1 day')).toBeVisible();
      });
    });

    describe('when the workflow has been waiting more than one day', () => {
      beforeEach(() => {
        const managerApprovedAt = new Date();
        managerApprovedAt.setDate(managerApprovedAt.getDate() - 3);

        render(<CardCallToAction workflow={{
          ...mockManagerApprovedWorkflowWithExtras,
          managerApprovedAt,
        }} status={Status.ManagerApproved} />);
      });

      test('shows the workflow has been waiting three days', () => {
        expect(screen.getByText('Waiting 3 days')).toBeVisible();
      });
    });
  });

  describe('a review soon status', () => {
    describe('when the workflow is due for review today', () => {
      beforeEach(() =>
        render(<CardCallToAction workflow={{
          ...mockWorkflowWithExtras,
          reviewBefore: new Date(),
        }} status={Status.ReviewSoon}/>));

      test('shows that the review is due today', () => {
        expect(screen.getByText('Review today')).toBeVisible();
      });
    });

    describe('when the workflow is due for review in a few days', () => {
      beforeEach(() => {
        jest
          .spyOn(global.Date, "now")
          .mockImplementation(() => new Date("2022-02-11T11:01:58.135Z").valueOf())

        render(<CardCallToAction workflow={{
          ...mockWorkflowWithExtras,
          reviewBefore: new Date("2022-02-14T11:01:58.135Z")
        }} status={Status.ReviewSoon}/>)
      });

      test('shows that the review is due in three days', () => {
        expect(screen.getByText('Review in 3 days')).toBeVisible();
      });
    });
  });

  describe('a overdue status', () => {
    beforeEach(() => {
      jest
        .spyOn(global.Date, "now")
        .mockImplementation(() => new Date("2022-02-14T11:01:58.135Z").valueOf())

      render(<CardCallToAction workflow={{
        ...mockWorkflowWithExtras,
        reviewBefore: new Date("2022-02-11T11:01:58.135Z")
      }} status={Status.Overdue}/>)
    });

    test('shows that the review was due three days ago', () => {
      expect(screen.getByText('Due 3 days ago')).toBeVisible();
    });
  });
})
