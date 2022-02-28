import { handler } from "../../../pages/api/content/filters"
import { NextApiRequest, NextApiResponse } from "next"

import localFilters from "../../../config/answerFilters/answerFilters.json"
import { mockAnswerFilter } from "../../../fixtures/answerFilter"
import { mockClient } from "aws-sdk-client-mock"
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { Readable } from "stream"

const switchEnv = environment => {
  const oldEnv = process.env.NODE_ENV
  process.env.NEXT_PUBLIC_ENV = environment
  // @ts-ignore
  process.env.NODE_ENV = environment

  return () => switchEnv(oldEnv)
}

let response

describe("/api/content/filters", () => {
  beforeEach(() => {
    response = {
      status: jest.fn().mockImplementation(() => response),
      json: jest.fn(),
    } as unknown as NextApiResponse
  })

  describe("When under test", () => {
    let switchBack

    beforeAll(() => (switchBack = switchEnv("test")))
    afterAll(() => switchBack())

    it("returns mock answer filters", async () => {
      const request = { method: "GET" } as unknown as NextApiRequest

      await handler(request, response)

      expect(response.status).toHaveBeenCalledWith(200)
      expect(response.json).toHaveBeenCalledWith({
        answerFilters: mockAnswerFilter,
      })
    })
  })

  describe("When in normal operation", () => {
    let switchBack

    beforeAll(() => {
      switchBack = switchEnv("not-test")

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

    it("returns remotely stored answer filters", async () => {
      const request = { method: "GET" } as unknown as NextApiRequest

      await handler(request, response)

      expect(response.status).toHaveBeenCalledWith(200)
      expect(response.json).toHaveBeenCalledWith({
        answerFilters: [mockAnswerFilter, mockAnswerFilter],
      })
    })

    describe("When S3 is not usable", function () {
      const error = console.error

      beforeAll(() => {
        mockClient(S3Client).on(GetObjectCommand).rejects()
        console.error = jest.fn()
      })

      afterAll(() => {
        console.error = error
      })

      it("returns locally stored answer filters", async () => {
        const request = { method: "GET" } as unknown as NextApiRequest

        await handler(request, response)

        expect(response.status).toHaveBeenCalledWith(200)
        expect(response.json).toHaveBeenCalledWith({
          answerFilters: localFilters,
        })
        expect(console.error).toHaveBeenCalledWith(
          `[content][error] loading answer filters from local store: Error`
        )
      })
    })
  })

  describe("invalid HTTP methods", () => {
    ;["POST", "PUT", "PATCH", "DELETE"].forEach(method => {
      it(`returns 405 for ${method}`, async () => {
        const request = { method: method } as unknown as NextApiRequest

        await handler(request, response)

        expect(response.status).toHaveBeenCalledWith(405)
        expect(response.json).toHaveBeenCalledWith({
          error: "Method not supported on this endpoint",
        })
      })
    })
  })
})
