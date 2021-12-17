import {handler} from "../../../../pages/api/workflows/[id]/approval"
import {NextApiResponse} from "next"
import {
  mockSubmittedWorkflowWithExtras,
  mockManagerApprovedWorkflowWithExtras,
} from "../../../../fixtures/workflows"
import prisma from "../../../../lib/prisma"
import {
  mockApprover,
  mockPanelApprover,
} from "../../../../fixtures/users"
import {notifyReturnedForEdits, notifyApprover} from "../../../../lib/notify"
import {triggerNextSteps} from "../../../../lib/nextSteps"
import {ApprovalActions as Actions} from "../../../../components/ManagerApprovalDialog"
import {Action} from "@prisma/client"
import {
  makeNextApiRequest,
  MakeNextApiRequestInput,
  testApiHandlerUnsupportedMethods
} from "../../../../lib/auth/test-functions";
import {
  mockSession,
  mockSessionApprover,
  mockSessionNotInPilot,
  mockSessionPanelApprover
} from "../../../../fixtures/session";

jest.mock("../../../../lib/prisma", () => ({
  workflow: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
}))

jest.mock("../../../../lib/cases")
jest.mock("../../../../lib/notify")
jest.mock("../../../../lib/nextSteps")

const mockDateNow = new Date()
jest
  .spyOn(global, "Date")
  .mockImplementation(() => mockDateNow as unknown as string)

const jsonMock = jest.fn();

const response = {
  status: jest.fn().mockReturnValue({json: jsonMock}),
  json: jsonMock,
} as unknown as NextApiResponse

const callApiHandler = async (request: MakeNextApiRequestInput) => {
  jsonMock.mockClear();
  (response.status as jest.Mock).mockClear();
  (prisma.workflow.findUnique as jest.Mock).mockClear();
  (prisma.workflow.update as jest.Mock).mockClear();
  await handler(makeNextApiRequest(request), response);
}

describe("pages/api/workflows/[id]/approval", () => {
  testApiHandlerUnsupportedMethods(handler, ['POST', 'DELETE']);

  describe("when the HTTP method is POST", () => {
    describe("and the workflow needs panel authorisation i.e. already manager approved", () => {
      beforeAll(() => {
        ;(prisma.workflow.findUnique as jest.Mock).mockResolvedValue(
          mockManagerApprovedWorkflowWithExtras
        )
        ;(prisma.workflow.update as jest.Mock).mockResolvedValue(
          mockManagerApprovedWorkflowWithExtras
        )
      });

      describe('when the user is not in the pilot group', function () {
        beforeAll(async () =>
          await callApiHandler({
            method: "POST",
            query: {id: mockManagerApprovedWorkflowWithExtras.id},
            session: mockSessionNotInPilot,
          })
        );

        it("returns a 400 http status", async () => {
          expect(response.status).toHaveBeenCalledWith(400)
        })
        it("searches for the workflow with the provided ID", async () => {
          expect(prisma.workflow.findUnique).toBeCalledWith({
            where: {id: mockManagerApprovedWorkflowWithExtras.id},
          })
        })
      });
      describe('when the user is neither an approver or panel approver', function () {
        beforeAll(async () =>
          await callApiHandler({
            method: "POST",
            query: {id: mockManagerApprovedWorkflowWithExtras.id},
            session: mockSession,
          })
        );

        it("returns a 400 http status", async () => {
          expect(response.status).toHaveBeenCalledWith(400)
        })
        it("searches for the workflow with the provided ID", async () => {
          expect(prisma.workflow.findUnique).toBeCalledWith({
            where: {id: mockManagerApprovedWorkflowWithExtras.id},
          })
        })
      });
      describe('when the user is only an approver', function () {
        beforeAll(async () =>
          await callApiHandler({
            method: "POST",
            query: {id: mockManagerApprovedWorkflowWithExtras.id},
            session: mockSessionApprover,
          })
        );

        it("returns a 400 http status", async () => {
          expect(response.status).toHaveBeenCalledWith(400)
        })
        it("searches for the workflow with the provided ID", async () => {
          expect(prisma.workflow.findUnique).toBeCalledWith({
            where: {id: mockManagerApprovedWorkflowWithExtras.id},
          })
        })
      });
      describe('when the user is a panel approver', function () {
        const expectedUpdatedWorkflow = {
          ...mockManagerApprovedWorkflowWithExtras,
          panelApprovedAt: mockDateNow,
          panelApprovedBy: mockApprover.email,
        };

        beforeAll(async () => {
          ;(prisma.workflow.update as jest.Mock).mockResolvedValueOnce(
            expectedUpdatedWorkflow
          )
          await callApiHandler({
            method: "POST",
            query: {id: mockManagerApprovedWorkflowWithExtras.id},
            session: mockSessionPanelApprover,
          })
        });

        it("searches for the workflow with the provided ID", async () => {
          expect(prisma.workflow.findUnique).toBeCalledWith({
            where: {id: mockSubmittedWorkflowWithExtras.id},
          })
        })
        it("updates the workflow with panel authorisation", async () => {
          expect(prisma.workflow.update).toBeCalledWith(
            expect.objectContaining({
              where: {id: mockManagerApprovedWorkflowWithExtras.id},
              data: expect.objectContaining({
                panelApprovedAt: mockDateNow,
                panelApprovedBy: mockApprover.email,
                revisions: expect.anything(),
              }),
            })
          )
        })
        it("includes the next steps of workflow that aren't triggered", async () => {
          expect(prisma.workflow.update).toBeCalledWith(
            expect.objectContaining({
              where: {id: mockManagerApprovedWorkflowWithExtras.id},
              include: expect.objectContaining({
                nextSteps: {
                  where: {
                    triggeredAt: null,
                  },
                },
              }),
            })
          )
        })
        it("includes the creator of workflow", async () => {
          expect(prisma.workflow.update).toBeCalledWith(
            expect.objectContaining({
              where: {id: mockManagerApprovedWorkflowWithExtras.id},
              include: expect.objectContaining({
                creator: true,
              }),
            })
          )
        })
        it("returns updated workflow", async () => {
          expect(jsonMock).toHaveBeenCalledWith(expectedUpdatedWorkflow)
        })
        it("triggers next steps for the workflow", async () => {
          expect(triggerNextSteps).toHaveBeenCalledWith(expectedUpdatedWorkflow)
        })
      });
    })

    describe("and the workflow needs manager approval", () => {
      beforeEach(() => {
        ;(prisma.workflow.findUnique as jest.Mock).mockResolvedValue(
          mockSubmittedWorkflowWithExtras
        )
        ;(prisma.workflow.update as jest.Mock).mockResolvedValue(
          mockSubmittedWorkflowWithExtras
        )
      });

      describe('when the user is not in the pilot group', () => {
        beforeAll(async () =>
          await callApiHandler({
            method: "POST",
            query: {id: mockSubmittedWorkflowWithExtras.id},
            session: mockSessionNotInPilot,
          })
        );

        it("returns a 400 http status", async () => {
          expect(response.status).toHaveBeenCalledWith(400)
        })
        it("searches for the workflow with the provided ID", async () => {
          expect(prisma.workflow.findUnique).toBeCalledWith({
            where: {id: mockSubmittedWorkflowWithExtras.id},
          })
        })
      });
      describe('when the user is neither an approver or panel approver', () => {
        beforeAll(async () =>
          await callApiHandler({
            method: "POST",
            query: {id: mockSubmittedWorkflowWithExtras.id},
            session: mockSession,
          })
        );

        it("returns a 400 http status", async () => {
          expect(response.status).toHaveBeenCalledWith(400)
        })
        it("searches for the workflow with the provided ID", async () => {
          expect(prisma.workflow.findUnique).toBeCalledWith({
            where: {id: mockSubmittedWorkflowWithExtras.id},
          })
        })
      });
      describe('when the user is only a panel approver', () => {
        beforeAll(async () =>
          await callApiHandler({
            method: "POST",
            query: {id: mockSubmittedWorkflowWithExtras.id},
            session: mockSession,
          })
        );

        it("returns a 400 http status", async () => {
          expect(response.status).toHaveBeenCalledWith(400)
        })

        it("searches for the workflow with the provided ID", async () => {
          expect(prisma.workflow.findUnique).toBeCalledWith({
            where: {id: mockSubmittedWorkflowWithExtras.id},
          })
        })
      });
      describe('when the user is only an approver', () => {
        describe('and the approval is with QAM', () => {
          const expectedUpdatedWorkflow = {
            ...mockSubmittedWorkflowWithExtras,
            managerApprovedAt: mockDateNow,
            managerApprovedBy: mockApprover.email,
          };

          beforeAll(async () => {
            ;(prisma.workflow.update as jest.Mock).mockResolvedValue(
              expectedUpdatedWorkflow
            )
            await callApiHandler({
              method: "POST",
              query: {id: mockSubmittedWorkflowWithExtras.id},
              session: mockSessionApprover,
              body: {
                panelApproverEmail: mockPanelApprover.email,
                action: Actions.ApproveWithQam,
              },
            })
          });

          it("searches for the workflow with the provided ID", async () => {
            expect(prisma.workflow.findUnique).toBeCalledWith({
              where: {id: mockSubmittedWorkflowWithExtras.id},
            })
          });

          it("updates the workflow with manager approval", async () => {
            expect(prisma.workflow.update).toBeCalledWith(
              expect.objectContaining({
                where: {id: mockSubmittedWorkflowWithExtras.id},
                data: expect.objectContaining({
                  managerApprovedAt: mockDateNow,
                  managerApprovedBy: mockApprover.email,
                  assignedTo: mockPanelApprover.email,
                  needsPanelApproval: true,
                }),
              })
            )
          });

          it("includes the next steps of workflow that aren't triggered", async () => {
            expect(prisma.workflow.update).toBeCalledWith(
              expect.objectContaining({
                where: {id: mockSubmittedWorkflowWithExtras.id},
                include: expect.objectContaining({
                  nextSteps: {
                    where: {
                      triggeredAt: null,
                    },
                  },
                }),
              })
            )
          });

          it("includes the creator of workflow", async () => {
            expect(prisma.workflow.update).toBeCalledWith(
              expect.objectContaining({
                where: {id: mockSubmittedWorkflowWithExtras.id},
                include: expect.objectContaining({
                  creator: true,
                }),
              })
            )
          });

          it("returns updated workflow", async () => {
            expect(response.json).toHaveBeenCalledWith(expectedUpdatedWorkflow)
          });

          it("triggers next steps for the workflow", async () => {
            expect(triggerNextSteps).toBeCalledWith(expectedUpdatedWorkflow)
          })
        });
        describe('and the approval is without QAM', () => {
          const expectedUpdatedWorkflow = {
            ...mockSubmittedWorkflowWithExtras,
            managerApprovedAt: mockDateNow,
            managerApprovedBy: mockApprover.email,
          };

          beforeAll(async () => {
            ;(prisma.workflow.update as jest.Mock).mockResolvedValue(
              expectedUpdatedWorkflow
            )
            await callApiHandler({
              method: "POST",
              query: {id: mockSubmittedWorkflowWithExtras.id},
              session: mockSessionApprover,
              body: {
                panelApproverEmail: mockPanelApprover.email,
                action: Actions.ApproveWithoutQam,
              },
            })
          });

          it("sets needs panel approval to false", async () => {
            expect(prisma.workflow.update).toBeCalledWith(
              expect.objectContaining({
                where: {id: mockSubmittedWorkflowWithExtras.id},
                data: expect.objectContaining({
                  managerApprovedAt: mockDateNow,
                  managerApprovedBy: mockApprover.email,
                  needsPanelApproval: false,
                }),
              })
            )
          });

          it("doesn't reassign the workflow", async () => {
            expect(prisma.workflow.update).toBeCalledWith(
              expect.objectContaining({
                where: {id: mockSubmittedWorkflowWithExtras.id},
                data: expect.not.objectContaining({
                  assignedTo: mockPanelApprover.email,
                }),
              })
            )
          });

          it("returns updated workflow", async () => {
            expect(response.json).toHaveBeenCalledWith(expectedUpdatedWorkflow)
          })

          it("sends an approval email to assignee of workflow", async () => {
            expect(notifyApprover).toBeCalledWith(
              expectedUpdatedWorkflow,
              mockPanelApprover.email,
              process.env.APP_URL
            )
          });

          it("triggers next steps for the workflow", async () => {
            expect(triggerNextSteps).toBeCalledWith(expectedUpdatedWorkflow)
          })

          describe('and a comment is given', function () {
            beforeAll(async () => {
              ;(prisma.workflow.update as jest.Mock).mockResolvedValue(
                expectedUpdatedWorkflow
              )
              await callApiHandler({
                method: "POST",
                query: {id: mockSubmittedWorkflowWithExtras.id},
                session: mockSessionApprover,
                body: {
                  panelApproverEmail: mockPanelApprover.email,
                  action: Actions.ApproveWithoutQam,
                  comment: "Some comment",
                },
              })
            });

            it("creates a comment", async () => {
              expect(prisma.workflow.update).toBeCalledWith(
                expect.objectContaining({
                  where: {id: mockSubmittedWorkflowWithExtras.id},
                  data: expect.objectContaining({
                    comments: {
                      create: {
                        text: "Some comment",
                        createdBy: mockPanelApprover.email,
                        action: Action.Approved,
                      },
                    },
                  }),
                })
              )
            });
          });
        });
      });
    });
  });

  describe("when the HTTP method is DELETE", () => {
    beforeEach(() => {
      ;(prisma.workflow.update as jest.Mock).mockResolvedValue(
        mockSubmittedWorkflowWithExtras
      )
    })

    describe('when the user is not in the pilot group', function () {
      beforeAll(async () =>
        await callApiHandler({
          method: "DELETE",
          query: {id: mockManagerApprovedWorkflowWithExtras.id},
          session: mockSessionNotInPilot,
        })
      );

      it("returns a 400 http status", async () => {
        expect(response.status).toHaveBeenCalledWith(400)
      })
      it("shows an unauthorised message", async () => {
        expect(response.json).toBeCalledWith({
          error: "You're not authorised to perform that action"
        })
      })
    });
    describe('when the user is neither an approver or panel approver', function () {
      beforeAll(async () =>
        await callApiHandler({
          method: "DELETE",
          query: {id: mockManagerApprovedWorkflowWithExtras.id},
          session: mockSession,
        })
      );

      it("returns a 400 http status", async () => {
        expect(response.status).toHaveBeenCalledWith(400)
      })
      it("shows an unauthorised message", async () => {
        expect(response.json).toBeCalledWith({
          error: "You're not authorised to perform that action"
        })
      })
    });

    describe('when the user is a panel approver only', function () {
      const expectedUpdatedWorkflow = {
        ...mockSubmittedWorkflowWithExtras,
        assignedTo: mockSubmittedWorkflowWithExtras.submittedBy,
        managerApprovedAt: null,
        submittedAt: null,
        comments: [{
          text: "Reasons for return",
          createdBy: mockSessionPanelApprover.email,
          action: Action.ReturnedForEdits,
        }],
      };

      beforeAll(async () => {
        ;(prisma.workflow.update as jest.Mock).mockResolvedValue(
          expectedUpdatedWorkflow
        )
        await callApiHandler({
          method: "DELETE",
          query: {id: mockSubmittedWorkflowWithExtras.id},
          session: mockSessionPanelApprover,
          body: {comment: "Reasons for return"},
        })
      });

      it("updates the workflow of the provided ID", async () => {
        expect(prisma.workflow.update).toBeCalledWith(
          expect.objectContaining({
            where: {id: mockSubmittedWorkflowWithExtras.id},
          })
        )
      })

      it("updates the workflow to no longer be approved", async () => {
        expect(prisma.workflow.update).toBeCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              managerApprovedAt: null,
            }),
          })
        )
      })

      it("updates the workflow to no longer be submitted", async () => {
        expect(prisma.workflow.update).toBeCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              submittedAt: null,
            }),
          })
        )
      })

      it("updates the workflow with the provided comments by current user", async () => {
        expect(prisma.workflow.update).toBeCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              comments: {
                create: {
                  action: "ReturnedForEdits",
                  createdBy: mockApprover.email,
                  text: "Reasons for return",
                },
              },
            }),
          })
        )
      })

      it("includes the creator when updating the workflow", async () => {
        expect(prisma.workflow.update).toBeCalledWith(
          expect.objectContaining({
            include: {
              creator: true,
            },
          })
        )
      })

      it("assigns workflow to submitter", async () => {
        expect(prisma.workflow.update).toBeCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              assignedTo: mockSubmittedWorkflowWithExtras.submittedBy,
            }),
          })
        )
      })

      it("sends a returned for edits email to assignee of workflow", async () => {
        expect(notifyReturnedForEdits).toBeCalledWith(
          expectedUpdatedWorkflow,
          mockSessionPanelApprover,
          process.env.APP_URL,
          "Reasons for return"
        )
      })

      it("returns updated workflow", async () => {
        expect(response.json).toHaveBeenCalledWith(
          expectedUpdatedWorkflow
        )
      })
    });

    describe('when the user is an approver', function () {
      const expectedUpdatedWorkflow = {
        ...mockSubmittedWorkflowWithExtras,
        assignedTo: mockSubmittedWorkflowWithExtras.submittedBy,
        managerApprovedAt: null,
        submittedAt: null,
        comments: [{
          text: "Reasons for return",
          createdBy: mockSessionApprover.email,
          action: Action.ReturnedForEdits,
        }],
      };

      beforeAll(async () => {
        ;(prisma.workflow.update as jest.Mock).mockResolvedValue(
          expectedUpdatedWorkflow
        )
        await callApiHandler({
          method: "DELETE",
          query: {id: mockSubmittedWorkflowWithExtras.id},
          session: mockSessionApprover,
          body: {comment: "Reasons for return"},
        })
      });

      it("updates the workflow of the provided ID", async () => {
        expect(prisma.workflow.update).toBeCalledWith(
          expect.objectContaining({
            where: {id: mockSubmittedWorkflowWithExtras.id},
          })
        )
      })

      it("updates the workflow to no longer be approved", async () => {
        expect(prisma.workflow.update).toBeCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              managerApprovedAt: null,
            }),
          })
        )
      })
    });
  })
})
