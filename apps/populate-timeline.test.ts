import { handler } from "./populate-timeline"
import { mockAuthorisedWorkflow } from "../fixtures/workflows"
import { mockUser } from "../fixtures/users"
import fetch from "node-fetch"
import { PrismaClient } from "@prisma/client"
import { mockResident } from "../fixtures/residents"

const mockWorkflow = {
  ...mockAuthorisedWorkflow,
  submittedBy: mockUser.email,
}

const mockFindMany = jest.fn().mockResolvedValue([])

jest.mock("@prisma/client")
;(PrismaClient as jest.Mock).mockImplementation(() => ({
  workflow: {
    findMany: mockFindMany,
  },
  Team: {
    Access: "Access",
  },
}))

jest.mock("../lib/cases")

jest.mock("../config/forms/forms.json", () => [
  { id: "mock-form", name: "Mock form" },
])

const mockCaseApiJson = jest.fn()

jest.mock("node-fetch", () =>
  jest.fn().mockImplementation(async () => ({
    json: mockCaseApiJson,
    status: 201,
    text: jest.fn().mockResolvedValue(null),
  }))
)

const replacedConsole = console

beforeAll(() => {
  console.log = jest.fn()
})

afterAll(() => {
  // eslint-disable-next-line no-global-assign
  console = replacedConsole
})

describe("when there are no workflows", () => {
  beforeAll(async () => {
    await handler()
  })

  it("looks for non-historic, completed workflows within the correct time range", () => {
    expect(mockFindMany).toBeCalledWith({
      where: {
        type: {
          not: "Historic",
        },
        OR: [
          {
            panelApprovedAt: {
              not: null,
              lt: new Date(2021, 10, 17, 14, 0, 0, 0),
            },
          },
          {
            managerApprovedAt: {
              not: null,
              lt: new Date(2021, 10, 17, 14, 0, 0, 0),
            },
            needsPanelApproval: false,
          },
        ],
      },
    })
  })

  it("logs connecting to db", () => {
    expect(console.log).toBeCalledWith("Connecting to DB...")
  })

  it("logs when done", () => {
    expect(console.log).toBeCalledWith("Done: 0 processed")
  })
})

describe("when there are some workflows which haven't been added as cases", () => {
  beforeAll(async () => {
    mockCaseApiJson.mockResolvedValueOnce({
      cases: [],
    })
    mockCaseApiJson.mockResolvedValueOnce({
      id: "123",
      firstName: "Firstname",
      lastName: "Surname",
      dateOfBirth: "2000-10-01",
      contextFlag: "C",
    })
    ;(mockFindMany as jest.Mock).mockResolvedValue([mockWorkflow])

    await handler()
  })

  it("calls fetch to get cases", () => {
    expect(fetch).toBeCalledWith(
      "https://virtserver.swaggerhub.com/Hackney/social-care-case-viewer-api/1.0.0/cases?worker_email=firstname.surname@hackney.gov.uk&mosaic_id=123&cursor=0",
      {
        headers: {
          "x-api-key": process.env.SOCIAL_CARE_API_KEY,
          "Content-Type": "application/json",
        },
      }
    )
  })

  it("calls fetch to get resident's details", () => {
    expect(fetch).toBeCalledWith(
      "https://virtserver.swaggerhub.com/Hackney/social-care-case-viewer-api/1.0.0/residents/123",
      {
        headers: {
          "x-api-key": process.env.SOCIAL_CARE_API_KEY,
        },
      }
    )
  })

  it("calls fetch to add cases", () => {
    expect(fetch).toBeCalledWith(
      "https://virtserver.swaggerhub.com/Hackney/social-care-case-viewer-api/1.0.0/cases",
      {
        headers: {
          "x-api-key": process.env.SOCIAL_CARE_API_KEY,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          formName: "Mock form",
          formNameOverall: "ASC_case_note",
          firstName: mockResident.firstName,
          lastName: mockResident.lastName,
          workerEmail: mockWorkflow.submittedBy,
          dateOfBirth: mockResident.dateOfBirth,
          personId: Number(mockResident.mosaicId),
          contextFlag: mockResident.ageContext,
          caseFormData: JSON.stringify({ workflowId: mockWorkflow.id }),
        }),
      }
    )
  })

  it("claims to have added a case", () => {
    expect(console.log).toBeCalledWith(
      `Added case for workflow ${mockWorkflow.id}`
    )
  })

  describe("when there are multiple pages of cases", () => {
    beforeAll(async () => {
      mockCaseApiJson.mockResolvedValueOnce({
        cases: [],
        nextCursor: "10",
      })
      mockCaseApiJson.mockResolvedValueOnce({
        cases: [],
      })
      mockCaseApiJson.mockResolvedValueOnce({
        id: "123",
        firstName: "Firstname",
        lastName: "Surname",
        dateOfBirth: "2000-10-01",
        contextFlag: "C",
      })
      ;(mockFindMany as jest.Mock).mockResolvedValue([mockWorkflow])

      await handler()
    })

    it("calls fetch to get first page of cases", () => {
      expect(fetch).toBeCalledWith(
        "https://virtserver.swaggerhub.com/Hackney/social-care-case-viewer-api/1.0.0/cases?worker_email=firstname.surname@hackney.gov.uk&mosaic_id=123&cursor=0",
        {
          headers: {
            "x-api-key": process.env.SOCIAL_CARE_API_KEY,
            "Content-Type": "application/json",
          },
        }
      )
    })

    it("calls fetch to get second page of cases", () => {
      expect(fetch).toBeCalledWith(
        "https://virtserver.swaggerhub.com/Hackney/social-care-case-viewer-api/1.0.0/cases?worker_email=firstname.surname@hackney.gov.uk&mosaic_id=123&cursor=10",
        {
          headers: {
            "x-api-key": process.env.SOCIAL_CARE_API_KEY,
            "Content-Type": "application/json",
          },
        }
      )
    })

    it("calls fetch to get resident's details", () => {
      expect(fetch).toBeCalledWith(
        "https://virtserver.swaggerhub.com/Hackney/social-care-case-viewer-api/1.0.0/residents/123",
        {
          headers: {
            "x-api-key": process.env.SOCIAL_CARE_API_KEY,
          },
        }
      )
    })

    it("calls fetch to add cases", () => {
      expect(fetch).toBeCalledWith(
        "https://virtserver.swaggerhub.com/Hackney/social-care-case-viewer-api/1.0.0/cases",
        {
          headers: {
            "x-api-key": process.env.SOCIAL_CARE_API_KEY,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({
            formName: "Mock form",
            formNameOverall: "ASC_case_note",
            firstName: mockResident.firstName,
            lastName: mockResident.lastName,
            workerEmail: mockWorkflow.submittedBy,
            dateOfBirth: mockResident.dateOfBirth,
            personId: Number(mockResident.mosaicId),
            contextFlag: mockResident.ageContext,
            caseFormData: JSON.stringify({ workflowId: mockWorkflow.id }),
          }),
        }
      )
    })

    it("claims to have added a case", () => {
      expect(console.log).toBeCalledWith(
        `Added case for workflow ${mockWorkflow.id}`
      )
    })
  })
})

describe("when there are some workflows which have been added as cases", () => {
  beforeAll(async () => {
    mockFindMany.mockResolvedValue([mockWorkflow])
    ;(fetch as jest.Mock).mockClear()
    mockCaseApiJson.mockResolvedValueOnce({
      cases: [
        {
          caseFormData: JSON.stringify({
            workflowId: mockWorkflow.id,
          }),
        },
        {
          caseFormData: JSON.stringify({
            property: "some value",
          }),
        },
      ],
      nextCursor: null,
    })
    mockCaseApiJson.mockResolvedValueOnce({
      id: "123",
      firstName: "Firstname",
      lastName: "Surname",
      dateOfBirth: "2000-10-01",
      contextFlag: "C",
    })

    await handler()
  })

  it("claims not to have added any cases", () => {
    expect(console.log).toBeCalledWith(
      `Case already exists for workflow ${mockWorkflow.id}. Skipping...`
    )
  })

  it("doesn't get resident's details", () => {
    expect(fetch).not.toBeCalledWith(
      "https://virtserver.swaggerhub.com/Hackney/social-care-case-viewer-api/1.0.0/residents/123",
      {
        headers: {
          "x-api-key": process.env.SOCIAL_CARE_API_KEY,
        },
      }
    )
  })

  it("doesn't add any cases", () => {
    expect(fetch).not.toBeCalledWith(
      "https://virtserver.swaggerhub.com/Hackney/social-care-case-viewer-api/1.0.0/cases",
      expect.objectContaining({ method: "POST" })
    )
  })
})
