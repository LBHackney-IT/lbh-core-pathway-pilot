const { PrismaClient } = require("@prisma/client")
const { DateTime } = require("luxon")
const prisma = new PrismaClient()

const expires = DateTime.local()
  .plus({
    hours: 1,
  })
  .toISO()

const main = async () => {
  // clear any existing stuff out, for predictable behaviour
  await prisma.session.deleteMany({})
  await prisma.account.deleteMany({})
  await prisma.user.deleteMany({})
  await prisma.workflow.deleteMany({})

  // set up fake users and sessions for us to log in with
  await prisma.user.create({
    data: {
      email: "fake.user@hackney.gov.uk",
      name: "Fake User",
      team: "InformationAssessment",

      sessions: {
        create: {
          sessionToken: "test-token",
          accessToken: "test-token",
          expires,
        },
      },
    },
  })
  await prisma.user.create({
    data: {
      email: "fake.approver@hackney.gov.uk",
      name: "Fake Approver",
      team: "InformationAssessment",
      approver: true,
      sessions: {
        create: {
          sessionToken: "test-approver-token",
          accessToken: "test-approver-token",
          expires,
        },
      },
    },
  })

  // create test workflows for us to use
  await prisma.workflow.createMany({
    data: [
      // one assigned to the test user
      {
        socialCareId: "1",
        formId: "example-form",
        createdBy: "fake.user@hackney.gov.uk",
        assignedTo: "fake.user@hackney.gov.uk",
      },
      // one assigned to no one
      {
        socialCareId: "1",
        formId: "example-form",
        createdBy: "fake.user@hackney.gov.uk",
      },
      // and one that is already approved
      {
        socialCareId: "1",
        formId: "example-form",
        createdBy: "fake.user@hackney.gov.uk",
        answers: {
          example: {
            "question one": "answer one",
          },
        },
        submittedAt: "2021-08-01T00:00:00.000Z",
        managerApprovedAt: "2021-08-01T00:00:00.000Z",
        panelApprovedAt: "2021-08-01T00:00:00.000Z",
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
