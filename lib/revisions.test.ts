import { diff } from "./revisions"

describe("diff", () => {
  it("correctly diffs a sentence", () => {
    const result = diff("this is an example sentence", "this is a sentence")
    expect(result).toBe(
      'this is <del role="deletion">an</del><ins role="insertion">a</ins> <del role="deletion">example </del>sentence'
    )
  })

  it("leaves identical sentences alone", () => {
    const result = diff("this is a sentence", "this is a sentence")
    expect(result).toBe("this is a sentence")
  })
})
