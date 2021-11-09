import { ResidentFromSCCV } from "../types"
import { getResidentById } from "./residents"

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

describe("getPersonById", () => {
  beforeEach(() => {
    ;(global.fetch as jest.Mock) = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(residentFromSCCV),
      })
    )
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
    ;(global.fetch as jest.Mock) = jest.fn(() =>
      Promise.resolve({
        status: 404,
      })
    )

    const result = await getResidentById("nonexistent id")

    expect(result).toBeNull()
  })

  it("maps id from API response to mosaicId", async () => {
    const result = await getResidentById("123456789")

    expect(fetch).toBeCalledTimes(1)
    expect(result).toStrictEqual(
      expect.objectContaining({ mosaicId: "123456789" })
    )
  })

  it("maps firstName from API response to firstName", async () => {
    const result = await getResidentById("123456789")

    expect(fetch).toBeCalledTimes(1)
    expect(result).toStrictEqual(expect.objectContaining({ firstName: "Jane" }))
  })

  it("maps lastName from API response to lastName", async () => {
    const result = await getResidentById("123456789")

    expect(fetch).toBeCalledTimes(1)
    expect(result).toStrictEqual(expect.objectContaining({ lastName: "Doe" }))
  })

  it("maps gender from API response to gender", async () => {
    const result = await getResidentById("123456789")

    expect(fetch).toBeCalledTimes(1)
    expect(result).toStrictEqual(expect.objectContaining({ gender: "U" }))
  })

  it("maps dateOfBirth from API response to dateOfBirth", async () => {
    const result = await getResidentById("123456789")

    expect(fetch).toBeCalledTimes(1)
    expect(result).toStrictEqual(
      expect.objectContaining({ dateOfBirth: "1980-03-31T00:00:00" })
    )
  })

  it("returns null for dateOfBirth if no date of birth exists", async () => {
    ;(global.fetch as jest.Mock) = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({ ...residentFromSCCV, dateOfBirth: undefined }),
      })
    )

    const result = await getResidentById("123456789")

    expect(fetch).toBeCalledTimes(1)
    expect(result).toStrictEqual(
      expect.objectContaining({
        dateOfBirth: null,
      })
    )
  })

  it("maps nhsNumber from API response to nhsNumber", async () => {
    const result = await getResidentById("123456789")

    expect(fetch).toBeCalledTimes(1)
    expect(result).toStrictEqual(
      expect.objectContaining({ nhsNumber: "987654321" })
    )
  })

  it("returns null for nhsNumber if no NHS number exists", async () => {
    ;(global.fetch as jest.Mock) = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({ ...residentFromSCCV, nhsNumber: undefined }),
      })
    )

    const result = await getResidentById("123456789")

    expect(fetch).toBeCalledTimes(1)
    expect(result).toStrictEqual(
      expect.objectContaining({
        nhsNumber: null,
      })
    )
  })

  it("maps contextFlag from API response to ageContext", async () => {
    const result = await getResidentById("123456789")

    expect(fetch).toBeCalledTimes(1)
    expect(result).toStrictEqual(expect.objectContaining({ ageContext: "A" }))
  })

  it("maps restricted from API response to restricted", async () => {
    const result = await getResidentById("123456789")

    expect(fetch).toBeCalledTimes(1)
    expect(result).toStrictEqual(expect.objectContaining({ restricted: "N" }))
  })

  it("maps address from API response to addressList if address exists", async () => {
    const result = await getResidentById("123456789")

    expect(fetch).toBeCalledTimes(1)
    expect(result).toStrictEqual(
      expect.objectContaining({
        addressList: [{ addressLine1: "123 Street Name", postCode: "N12 5TT" }],
      })
    )
  })

  it("returns empty array for addressList if no addresses", async () => {
    ;(global.fetch as jest.Mock) = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({ ...residentFromSCCV, address: undefined }),
      })
    )

    const result = await getResidentById("123456789")

    expect(fetch).toBeCalledTimes(1)
    expect(result).toStrictEqual(
      expect.objectContaining({
        addressList: [],
      })
    )
  })

  it("maps phoneNumbers from API response to phoneNumber if phone numbers exists", async () => {
    const result = await getResidentById("123456789")

    expect(fetch).toBeCalledTimes(1)
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
    ;(global.fetch as jest.Mock) = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({ ...residentFromSCCV, phoneNumbers: [] }),
      })
    )

    const result = await getResidentById("123456789")

    expect(fetch).toBeCalledTimes(1)
    expect(result).toStrictEqual(
      expect.objectContaining({
        phoneNumber: [],
      })
    )
  })
})
