import { ResidentFromSCCV } from "../types"
import {
  getFullResidentById,
  getResidentById,
  isFullResident,
} from "./residents"
import fetch from "node-fetch"
import { mockFullResident } from "../fixtures/fullResidents"
import { mockWorkflowWithExtras } from "../fixtures/workflows"
import prisma from "./prisma"

jest.mock("./prisma", () => ({
  workflow: { findUnique: jest.fn() },
}))
jest.mock("node-fetch", () => jest.fn())

const residentFromSCCV: ResidentFromSCCV = {
  id: 123456789,
  title: "Miss",
  firstName: "Jane",
  lastName: "Doe",
  gender: "U",
  dateOfBirth: "1980-03-31T00:00:00",
  dateOfDeath: "",
  ethnicity: "C.C11",
  firstLanguage: "English",
  religion: "None",
  sexualOrientation: "Prefer not to say",
  nhsNumber: 987654321,
  emailAddress: "jane.doe@example.com",
  preferredMethodOfContact: "Email",
  contextFlag: "A",
  restricted: "N",
  address: {
    address: "123 Street Name",
    postcode: "N12 5TT",
  },
  phoneNumbers: [
    {
      number: "07777777777",
      type: "Mobile",
    },
    {
      number: "02081234567",
      type: "Home",
    },
  ],
  otherNames: [
    {
      firstName: "Jane Elizabeth",
      lastName: "Doe",
    },
  ],
}

process.env.SOCIAL_CARE_API_KEY = "test-api-key"

describe("getFullResidentById", () => {
  describe("isFullResident", () => {
    it("returns false for a short form resident", async () => {
      ;(fetch as unknown as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue(residentFromSCCV),
      })
      expect(isFullResident(await getResidentById("123456789"))).toBeFalsy()
    })

    it("returns false for a null", () => {
      expect(isFullResident(null)).toBeFalsy()
    })

    it("returns false for a true boolean", () => {
      expect(isFullResident(true)).toBeFalsy()
    })

    it("returns false for an empty array", () => {
      expect(isFullResident([])).toBeFalsy()
    })

    it("returns true for a full resident", () => {
      expect(isFullResident(mockFullResident)).toBeTruthy()
    })
  })

  describe("without a workflow id", () => {
    beforeAll(async () => {
      ;(fetch as unknown as jest.Mock).mockClear()
      ;(fetch as unknown as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockFullResident),
      })
      await getFullResidentById("123456789")
    })

    it("makes a request to the resident api", () => {
      expect(fetch).toBeCalledWith(
        expect.anything(),
        expect.objectContaining({
          headers: expect.objectContaining({
            "x-api-key": "test-api-key",
          }),
        })
      )
    })
  })

  describe("with a workflow id", () => {
    describe("when the resident has not been persisted", () => {
      let resident

      beforeAll(async () => {
        ;(fetch as unknown as jest.Mock).mockClear()
        ;(prisma.workflow.findUnique as jest.Mock).mockResolvedValue(
          mockWorkflowWithExtras
        )
        resident = await getFullResidentById("123456789", "19145nu4uiszd")
      })

      it("makes a request to the resident api", () => {
        expect(fetch).toBeCalledWith(
          expect.anything(),
          expect.objectContaining({
            headers: expect.objectContaining({
              "x-api-key": "test-api-key",
            }),
          })
        )
      })

      it("returns the live resident details", () => {
        expect(resident).toEqual(mockFullResident)
      })
      it("returns the live resident details with fromSnapshot marked as false & no the workflow submmitedAt date", () => {
        expect(resident.fromSnapshot).toEqual(false)
        expect(resident.workflowSubmittedAt).toBeFalsy()
      })
      describe("when the resident has not been persisted but the workflow has been submitted", () => {
        let resident
        const submittedAtDate = new Date()

        beforeAll(async () => {
          ;(fetch as unknown as jest.Mock).mockClear()
          ;(prisma.workflow.findUnique as jest.Mock).mockResolvedValue({
            ...mockWorkflowWithExtras,
            submittedAt: submittedAtDate,
          })
          resident = await getFullResidentById("123456789", "19145nu4uiszd")
        })
        it("returns the live resident details with fromSnapshot marked as false & the workflow submmitedAt date", () => {
          expect(resident.fromSnapshot).toEqual(false)

          expect(resident.workflowSubmittedAt).toEqual(submittedAtDate)
        })
      })
    })

    describe("when the resident has been persisted", () => {
      let resident
      const submittedAtDate = new Date()

      beforeAll(async () => {
        ;(fetch as unknown as jest.Mock).mockClear()
        ;(prisma.workflow.findUnique as jest.Mock).mockResolvedValue({
          ...mockWorkflowWithExtras,
          resident: mockFullResident,
          submittedAt: submittedAtDate,
        })
        resident = await getFullResidentById("123456789", "19145nu4uiszd")
      })

      it("does not make a request to the resident api", () => {
        expect(fetch).not.toBeCalledWith()
      })

      it("returns the live resident details", () => {
        expect(resident).toEqual(mockFullResident)
      })

      it("returns the live resident details with fromSnapshot marked as true & the workflow submmitedAt date", () => {
        expect(resident.fromSnapshot).toEqual(true)
        expect(resident.workflowSubmittedAt).toEqual(submittedAtDate)
      })
    })
  })
})

describe("getPersonById", () => {
  beforeEach(() => {
    ;(fetch as unknown as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValue(residentFromSCCV),
    })
    ;(fetch as unknown as jest.Mock).mockClear()
  })

  it("calls the service API using an API key", async () => {
    await getResidentById("123456789")

    expect(fetch).toBeCalledWith(
      expect.anything(),
      expect.objectContaining({
        headers: expect.objectContaining({
          "x-api-key": "test-api-key",
        }),
      })
    )
  })

  it("calls the service API using the resident endpoint", async () => {
    await getResidentById("123456789")

    expect(fetch).toBeCalledWith(
      expect.stringContaining("/residents/123456789"),
      expect.anything()
    )
  })

  it("returns null if there is no match", async () => {
    ;(fetch as unknown as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        status: 404,
      })
    )

    const result = await getResidentById("nonexistent id")

    expect(result).toBeNull()
  })

  it("maps id from API response to mosaicId", async () => {
    const result = await getResidentById("123456789")

    expect(result).toStrictEqual(
      expect.objectContaining({ mosaicId: "123456789" })
    )
  })

  it("maps firstName from API response to firstName", async () => {
    const result = await getResidentById("123456789")

    expect(result).toStrictEqual(expect.objectContaining({ firstName: "Jane" }))
  })

  it("maps lastName from API response to lastName", async () => {
    const result = await getResidentById("123456789")

    expect(result).toStrictEqual(expect.objectContaining({ lastName: "Doe" }))
  })

  it("maps gender from API response to gender", async () => {
    const result = await getResidentById("123456789")

    expect(result).toStrictEqual(expect.objectContaining({ gender: "U" }))
  })

  it("maps dateOfBirth from API response to dateOfBirth", async () => {
    const result = await getResidentById("123456789")

    expect(result).toStrictEqual(
      expect.objectContaining({ dateOfBirth: "1980-03-31T00:00:00" })
    )
  })

  it("returns null for dateOfBirth if no date of birth exists", async () => {
    ;(fetch as unknown as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({ ...residentFromSCCV, dateOfBirth: undefined }),
      })
    )

    const result = await getResidentById("123456789")

    expect(result).toStrictEqual(
      expect.objectContaining({
        dateOfBirth: null,
      })
    )
  })

  it("maps nhsNumber from API response to nhsNumber", async () => {
    const result = await getResidentById("123456789")

    expect(result).toStrictEqual(
      expect.objectContaining({ nhsNumber: "987654321" })
    )
  })

  it("returns null for nhsNumber if no NHS number exists", async () => {
    ;(fetch as unknown as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({ ...residentFromSCCV, nhsNumber: undefined }),
      })
    )

    const result = await getResidentById("123456789")

    expect(result).toStrictEqual(
      expect.objectContaining({
        nhsNumber: null,
      })
    )
  })

  it("maps contextFlag from API response to ageContext", async () => {
    const result = await getResidentById("123456789")

    expect(result).toStrictEqual(expect.objectContaining({ ageContext: "A" }))
  })

  it("maps restricted from API response to restricted", async () => {
    const result = await getResidentById("123456789")

    expect(fetch).toBeCalledTimes(1)
    expect(result).toStrictEqual(expect.objectContaining({ restricted: "N" }))
  })

  it("maps address from API response to addressList if address exists", async () => {
    const result = await getResidentById("123456789")

    expect(result).toStrictEqual(
      expect.objectContaining({
        addressList: [{ addressLine1: "123 Street Name", postCode: "N12 5TT" }],
      })
    )
  })

  it("returns empty array for addressList if no addresses", async () => {
    ;(fetch as unknown as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({ ...residentFromSCCV, address: undefined }),
      })
    )

    const result = await getResidentById("123456789")

    expect(result).toStrictEqual(
      expect.objectContaining({
        addressList: [],
      })
    )
  })

  it("maps phoneNumbers from API response to phoneNumber if phone numbers exists", async () => {
    const result = await getResidentById("123456789")

    expect(result).toStrictEqual(
      expect.objectContaining({
        phoneNumber: [
          { phoneNumber: "07777777777", phoneType: "Mobile" },
          { phoneNumber: "02081234567", phoneType: "Home" },
        ],
      })
    )
  })

  it("returns empty array for phoneNumber if no phone number exists", async () => {
    ;(fetch as unknown as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve({ ...residentFromSCCV, phoneNumbers: [] }),
      })
    )

    const result = await getResidentById("123456789")

    expect(result).toStrictEqual(
      expect.objectContaining({
        phoneNumber: [],
      })
    )
  })

  it("maps ethnicity from API response to ethnicity", async () => {
    const result = await getResidentById("123456789")

    expect(fetch).toBeCalledTimes(1)
    expect(result).toStrictEqual(
      expect.objectContaining({ ethnicity: "C.C11" })
    )
  })

  it("returns null for ethnicity if no ethnicity provided", async () => {
    ;(fetch as unknown as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({ ...residentFromSCCV, ethnicity: undefined }),
      })
    )

    const result = await getResidentById("123456789")

    expect(result).toStrictEqual(
      expect.objectContaining({
        ethnicity: null,
      })
    )
  })

  it("maps firstLanguage from API response to firstLanguage", async () => {
    const result = await getResidentById("123456789")

    expect(result).toStrictEqual(
      expect.objectContaining({ firstLanguage: "English" })
    )
  })

  it("returns null for firstLanguage if no first language provided", async () => {
    ;(fetch as unknown as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({ ...residentFromSCCV, firstLanguage: undefined }),
      })
    )

    const result = await getResidentById("123456789")

    expect(result).toStrictEqual(
      expect.objectContaining({
        firstLanguage: null,
      })
    )
  })

  it("maps religion from API response to religion", async () => {
    const result = await getResidentById("123456789")

    expect(result).toStrictEqual(expect.objectContaining({ religion: "None" }))
  })

  it("returns null for religion if no religion provided", async () => {
    ;(fetch as unknown as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({ ...residentFromSCCV, religion: undefined }),
      })
    )

    const result = await getResidentById("123456789")

    expect(result).toStrictEqual(
      expect.objectContaining({
        religion: null,
      })
    )
  })

  it("maps sexualOrientation from API response to sexualOrientation", async () => {
    const result = await getResidentById("123456789")

    expect(result).toStrictEqual(
      expect.objectContaining({ sexualOrientation: "Prefer not to say" })
    )
  })

  it("returns null for sexualOrientation if no sexual orientation provided", async () => {
    ;(fetch as unknown as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            ...residentFromSCCV,
            sexualOrientation: undefined,
          }),
      })
    )

    const result = await getResidentById("123456789")

    expect(result).toStrictEqual(
      expect.objectContaining({
        sexualOrientation: null,
      })
    )
  })

  it("maps emailAddress from API response to emailAddress", async () => {
    const result = await getResidentById("123456789")

    expect(result).toStrictEqual(
      expect.objectContaining({ emailAddress: "jane.doe@example.com" })
    )
  })

  it("returns null for emailAddress if no email address provided", async () => {
    ;(fetch as unknown as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({ ...residentFromSCCV, emailAddress: undefined }),
      })
    )

    const result = await getResidentById("123456789")

    expect(result).toStrictEqual(
      expect.objectContaining({
        emailAddress: null,
      })
    )
  })

  it("maps preferredMethodOfContact from API response to preferredMethodOfContact", async () => {
    const result = await getResidentById("123456789")

    expect(result).toStrictEqual(
      expect.objectContaining({ preferredMethodOfContact: "Email" })
    )
  })

  it("returns null for preferredMethodOfContact if no preferred method of contact provided", async () => {
    ;(fetch as unknown as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            ...residentFromSCCV,
            preferredMethodOfContact: undefined,
          }),
      })
    )

    const result = await getResidentById("123456789")

    expect(result).toStrictEqual(
      expect.objectContaining({
        preferredMethodOfContact: null,
      })
    )
  })

  it("maps otherNames from API response to otherNames if other names exist", async () => {
    const result = await getResidentById("123456789")

    expect(result).toStrictEqual(
      expect.objectContaining({
        otherNames: [{ firstName: "Jane Elizabeth", lastName: "Doe" }],
      })
    )
  })

  it("returns empty array for otherNames if no other names exist", async () => {
    ;(fetch as unknown as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve({ ...residentFromSCCV, otherNames: [] }),
      })
    )

    const result = await getResidentById("123456789")

    expect(result).toStrictEqual(
      expect.objectContaining({
        otherNames: [],
      })
    )
  })
})
