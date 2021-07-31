import { getPersonById } from "./residents"
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

describe("getPersonById", () => {
  it("returns one matching resident from an array", async () => {
    const result = await getPersonById("1")

    expect(fetch).toBeCalledTimes(1)
    expect(result).toMatchObject({
      mosaicId: "1",
    })
  })

  it("returns null if there is no match", async () => {
    const result = await getPersonById("nonexistent id")
    expect(result).toBeNull()
  })
})
