import { getResidentById } from "./residents"
;(global.fetch as jest.Mock) = jest.fn(() =>
  Promise.resolve({
    json: () =>
      Promise.resolve({
        residents: [
          {
            mosaicId: "1",
          },
          {
            mosaicId: "2",
          },
        ],
      }),
  })
)

process.env.SOCIAL_CARE_API_KEY = "test-api-key"

describe("getPersonById", () => {
  beforeEach(() => {
    ;(global.fetch as jest.Mock).mockClear()
  })

  it("returns one matching resident from an array", async () => {
    const result = await getResidentById("1")

    expect(fetch).toBeCalledTimes(1)
    expect(result).toMatchObject({
      mosaicId: "1",
    })
  })

  it("calls the service API using an API key", async () => {
    await getResidentById("1")

    expect(fetch).toBeCalledWith(
      expect.anything(),
      expect.objectContaining({
        headers: expect.objectContaining({
          "x-api-key": "test-api-key"
        })
      }),
    )
  })

  it("calls the service API using the residents endpoint", async () => {
    await getResidentById("1")

    expect(fetch).toBeCalledWith(
      expect.stringContaining("/residents"),
      expect.anything()
    )
  })

  it("calls the service API with the provided ID", async () => {
    await getResidentById("1")

    expect(fetch).toBeCalledWith(
      expect.stringContaining("id=1"),
      expect.anything()
    )
  })

  it("returns null if there is no match", async () => {
    const result = await getResidentById("nonexistent id")

    expect(result).toBeNull()
  })
})
