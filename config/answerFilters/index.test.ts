import { answerFiltersForThisEnv } from "./index"
import { mockAnswerFilter } from "../../fixtures/answerFilter"
import answerFilters from "./answerFilters.json"
import { mockClient } from "aws-sdk-client-mock"
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3"
import { Readable } from "stream"

const switchEnv = environment => {
  const oldEnv = process.env.NODE_ENV
  process.env.NEXT_PUBLIC_ENV = environment
  // @ts-ignore
  process.env.NODE_ENV = environment

  return () => switchEnv(oldEnv)
}

describe("When under test", () => {
  let switchBack

  beforeAll(() => (switchBack = switchEnv("test")))
  afterAll(() => switchBack())

  test("answerFiltersForThisEnv returns mockAnswerFilter", async () => {
    expect(await answerFiltersForThisEnv()).toStrictEqual(mockAnswerFilter)
  })
})

describe("When in production", () => {
  let switchBack

  beforeAll(() => {
    switchBack = switchEnv("prod")

    mockClient(S3Client)
      .on(GetObjectCommand)
      .resolves({
        Body: new Readable({
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          read(size: number) {
            this.push(JSON.stringify([mockAnswerFilter, mockAnswerFilter]))
            this.push(null)
          },
        }),
      })
  })
  afterAll(() => switchBack())

  test("answerFiltersForThisEnv returns a result from S3", async () => {
    expect(await answerFiltersForThisEnv()).toStrictEqual([
      mockAnswerFilter,
      mockAnswerFilter,
    ])
  })

  describe("When S3 is not contactable", () => {
    const error = console.error

    beforeAll(() => {
      mockClient(S3Client).on(GetObjectCommand).rejects()
      console.error = jest.fn()
    })

    afterAll(() => {
      console.error = error
    })

    test("answerFiltersForThisEnv returns answerFilters.json", async () => {
      expect(await answerFiltersForThisEnv()).toStrictEqual(answerFilters)
      expect(console.error).toHaveBeenCalledWith(
        `[content][error] loading answer filters from local store: Error`
      )
    })
  })
})
