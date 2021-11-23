import { handler } from "./populate-timeline"
import prisma from "../lib/prisma"
import { mockAuthorisedWorkflow } from "../fixtures/workflows"
import { mockUser } from "../fixtures/users"
import { addRecordToCase } from "../lib/cases"
import fetch from "node-fetch"

const mockWorkflow = {
  ...mockAuthorisedWorkflow,
  submittedBy: mockUser.email,
}

jest.mock("../lib/prisma", () => ({
  workflow: {
    findMany: jest.fn().mockResolvedValue([]),
  },
}))

jest.mock("../lib/cases")

const mockCaseApiJson = jest.fn().mockResolvedValue({
  nextCursor: null,
  cases: [],
})

jest.mock("node-fetch", () =>
  jest.fn().mockImplementation(async () => ({
    json: mockCaseApiJson,
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
    expect(prisma.workflow.findMany).toBeCalledWith({
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
    ;(prisma.workflow.findMany as jest.Mock).mockResolvedValue([mockWorkflow])

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

  it("calls fetch to add cases", () => {
    expect(addRecordToCase).toBeCalledWith(mockWorkflow)
  })

  it("claims to have added a case", () => {
    expect(console.log).toBeCalledWith(
      `Added case for workflow ${mockWorkflow.id}`
    )
  })
})

describe("when there are some workflows which have been added as cases", () => {
  beforeAll(async () => {
    ;(addRecordToCase as jest.Mock).mockClear()
    ;(prisma.workflow.findMany as jest.Mock).mockResolvedValue([mockWorkflow])

    mockCaseApiJson.mockResolvedValue({
      cases: [
        {
          caseFormData: {
            workflowId: mockWorkflow.id,
          },
        },
      ],
      nextCursor: null,
    })

    await handler()
  })

  it("claims not to have added any cases", () => {
    expect(console.log).toBeCalledWith(
      `Case already exists for workflow ${mockWorkflow.id}. Skipping...`
    )
  })

  it("doesn't add any cases", () => {
    expect(addRecordToCase).not.toBeCalled()
  })
})
