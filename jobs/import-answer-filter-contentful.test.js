const fs = require("fs")
const run = require("./import-answer-filter-contentful")
const fetch = require("node-fetch")

process.exit = jest.fn()
console.log = jest.fn()
fs.writeFileSync = jest.fn()

jest.mock("node-fetch")
fetch.mockReturnValue({
  json: jest.fn(),
})

describe.skip("answer filter import job", () => {
  beforeAll(async () => {
    jest.resetAllMocks()
    await run()
  })

  it("runs, completes and exits successfully", () => {
    expect(console.log).toBeCalledWith("📡 Running job...")
    expect(console.log).toBeCalledWith("✅ Done")
    expect(process.exit).toBeCalled()
  })

  it("writes a file", () => {
    expect(fs.writeFileSync).toBeCalledWith(
      "./config/answerFilters/answerFilters.json",
      expect.anything()
    )
  })

  it("calls the contentful api with the right arguments", () => {
    expect(fetch).toBeCalledWith(
      expect.stringContaining("https://cdn.contentful.com"),
      {
        headers: {
          Authorization: expect.anything(),
        },
      }
    )
    expect(fetch).toBeCalledWith(
      expect.stringContaining("/entries?content_type=step&include=10"),
      expect.anything()
    )
  })
})
