require("dotenv-flow").config()
const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

const main = async () => {
  // clear any existing stuff out, for predictable behaviour?
  await prisma.nextStep.deleteMany({})
  await prisma.revision.deleteMany({})
  await prisma.workflow.deleteMany({})
  await prisma.user.deleteMany({})

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
      // and one that is already approved and has a resident snapshot
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
        resident: {
          id: "33556688",
          title: "Ms",
          emails: ["sample@domain.com"],
          gender: "Non-binary",
          address: {
            uprn: 1000000001,
            address: "1 Hillman Street",
            postcode: "E8 1DY",
          },
          pronoun: "They/them",
          techUse: ["Mobile phone", "Landline", "Internet", "Telecare"],
          lastName: "Newname",
          mosaicId: "33556688",
          openCase: true,
          religion: "Religion",
          blueBadge: true,
          createdBy: "worker@domain.com",
          ethnicity: "A.A26",
          firstName: "John",
          gpDetails: {
            name: "Firstname Surname",
            email: "firstname.surname@nhs.uk",
            phone: "0777 777 7777",
            address: "123 Town St",
            postcode: "W1A 1AA",
          },
          nhsNumber: "4505577104",
          disability: ["Autism", "Hearing impairment"],
          employment: "Paid - less than 16 hours a week",
          otherNames: [],
          rentRecord: "up to date",
          restricted: "Y",
          tenureType: "Assured shorthold",
          contextFlag: "A",
          dateOfBirth: "2019-08-24",
          dateOfDeath: "2019-08-24",
          keyContacts: [{ name: "Foo bar", email: "foo.bar@gmail.com" }],
          lastUpdated: {
            housing: "2022-01-26T11:54:31.280Z",
            contactDetails: "2022-01-26T11:54:31.280Z",
          },
          accessToHome: "Via keyholder",
          careProvider: "Helping Hands Inc",
          deafRegister: "Certified",
          fromSnapshot: false,
          phoneNumbers: [
            { type: "Mobile", number: "55566667777" },
            { type: "Landline", number: "77788889999" },
          ],
          allocatedTeam: "Access",
          blindRegister: "Registered",
          firstLanguage: "English",
          maritalStatus: "Single",
          housingBenefit: "Applied but payments not yet started",
          housingOfficer: "Firstname Surname",
          cautionaryAlert: false,
          fluentInEnglish: true,
          livingSituation: "Private tenant",
          accomodationType: "Flat",
          councilTenureType: "Assured shorthold",
          immigrationStatus: "Indefinite leave to remain",
          interpreterNeeded: false,
          preferredLanguage: "English",
          sexualOrientation: "Sexual orientation",
          primarySupportReason: "Support with memory and cognition",
          genderAssignedAtBirth: false,
          housingStaffInContact: true,
          posessionEvictionOrder: "Order issued early 2022",
          preferredMethodOfContact: "Email",
          communicationDifficulties: false,
          difficultyMakingDecisions: false,
          mentalHealthSectionStatus: "Section 117 MHA 1983",
          tenancyHouseholdStructure: "Living alone",
          communicationDifficultiesDetails: false,
        },
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
      {
        id: "review-workflow",
        socialCareId: "33556688",
        formId: "mock-form",
        createdBy: "fake.user@hackney.gov.uk",
        answers: {
          "mock-step": { "mock-question": "Mock answer" },
          "mock-step-2": { "mock-question-2": "Mock answer 2" },
          "mock-step-3": { "mock-question-3": "Mock answer 3" },
        },
        updatedBy: "fake.user@hackney.gov.uk",
        submittedAt: "2021-08-02T00:00:00.000Z",
        submittedBy: "fake.user@hackney.gov.uk",
        managerApprovedAt: "2021-08-02T00:00:00.000Z",
        managerApprovedBy: "fake.user@hackney.gov.uk",
        panelApprovedAt: "2021-08-02T00:00:00.000Z",
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
