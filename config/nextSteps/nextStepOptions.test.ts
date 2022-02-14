import nextStepOptions from "./nextStepOptions.json"
import { nextStepOptionsForThisEnv } from "./nextStepOptions"
import { mockNextStepOptions } from "../../fixtures/nextStepOptions"
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

  test("nextStepOptionsForThisEnv returns mockNextStepOptions", async () => {
    expect(await nextStepOptionsForThisEnv()).toStrictEqual(mockNextStepOptions)
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
            this.push(
              JSON.stringify([mockNextStepOptions, mockNextStepOptions])
            )
            this.push(null)
          },
        }),
      })
  })
  afterAll(() => switchBack())

  test("nextStepOptionsForThisEnv returns a result from S3", async () => {
    expect(await nextStepOptionsForThisEnv()).toStrictEqual([
      mockNextStepOptions,
      mockNextStepOptions,
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

    test("nextStepOptionsForThisEnv returns nextStepOptions.json", async () => {
      expect(await nextStepOptionsForThisEnv()).toStrictEqual(nextStepOptions)
      expect(console.error).toHaveBeenCalledWith(
        `[content][error] loading next step options from local store: Error`
      )
    })
  })
})
