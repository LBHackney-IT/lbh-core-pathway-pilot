require('dotenv-flow').config()
const { PrismaClient } = require("@prisma/client")
const { DateTime } = require("luxon")
const prisma = new PrismaClient()

const expires = DateTime.local()
  .plus({
    hours: 1,
  })
  .toISO()

const main = async () => {
  // clear any existing stuff out, for predictable behaviour?
  await prisma.user.deleteMany({})
  await prisma.workflow.deleteMany({})

  // set up fake users and sessions for us to log in with
  await prisma.user.create({
    data: {
      email: "fake.user@hackney.gov.uk",
      name: "Fake User",
      team: "Access",
    },
  })
  await prisma.user.create({
    data: {
      email: "fake.approver@hackney.gov.uk",
      name: "Fake Approver",
      team: "CareManagement",
      approver: true,
      panelApprover: false,
    },
  })
  await prisma.user.create({
    data: {
      email: "fake.panel.approver@hackney.gov.uk",
      name: "Fake Panel Approver",
      team: "CareManagement",
      approver: false,
      panelApprover: true,
    },
  })

  // create test workflows for us to use
  await prisma.workflow.createMany({
    data: [
      // one assigned to the test user
      {
        socialCareId: "33556688",
        formId: "mock-form",
        createdBy: "fake.user@hackney.gov.uk",
        assignedTo: "fake.user@hackney.gov.uk",
      },
      // one assigned to no one
      {
        socialCareId: "33556688",
        formId: "mock-form",
        createdBy: "fake.user@hackney.gov.uk",
      },
      // one that is submitted but unapproved
      {
        id: "submitted-workflow",
        socialCareId: "33556688",
        formId: "mock-form",
        createdBy: "fake.user@hackney.gov.uk",
        answers: {
          example: {
            "question one": "answer one",
          },
        },
        updatedBy: "fake.user@hackney.gov.uk",
        submittedAt: "2021-08-01T00:00:00.000Z",
        submittedBy: "fake.user@hackney.gov.uk",
      },
      // and one that is already approved
      {
        id: "no-action-workflow",
        socialCareId: "33556688",
        formId: "mock-form",
        createdBy: "fake.user@hackney.gov.uk",
        answers: {
          example: {
            "question one": "answer one",
          },
        },
        updatedBy: "fake.user@hackney.gov.uk",
        submittedAt: "2021-08-01T00:00:00.000Z",
        submittedBy: "fake.user@hackney.gov.uk",
        managerApprovedAt: "2021-08-01T00:00:00.000Z",
        managerApprovedBy: "fake.user@hackney.gov.uk",
        panelApprovedAt: "2021-08-01T00:00:00.000Z",
        panelApprovedBy: "fake.user@hackney.gov.uk",
      },
      {
        id: "reassessment-workflow",
        socialCareId: "33556688",
        formId: "mock-form",
        createdBy: "fake.user@hackney.gov.uk",
        answers: {
          "mock-step": { "mock-question": "Mock answer" },
          "mock-step-2": { "mock-question-2": "Mock answer 2" },
          "mock-step-3": { "mock-question-3": "Mock answer 3" },
        },
        updatedBy: "fake.user@hackney.gov.uk",
        submittedAt: "2021-08-01T00:00:00.000Z",
        submittedBy: "fake.user@hackney.gov.uk",
        managerApprovedAt: "2021-08-01T00:00:00.000Z",
        managerApprovedBy: "fake.user@hackney.gov.uk",
        panelApprovedAt: "2021-08-01T00:00:00.000Z",
        panelApprovedBy: "fake.user@hackney.gov.uk",
      },
    ],
  })

  // and some test revisions
  await prisma.revision.createMany({
    data: [
      {
        workflowId: "no-action-workflow",
        createdBy: "fake.user@hackney.gov.uk",
        answers: {
          example: {
            "question one": "answer two",
          },
        },
      },
    ],
  })
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

module.exports = main
