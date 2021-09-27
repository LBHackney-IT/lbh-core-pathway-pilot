import { handler } from "../../../pages/api/content/forms"
import { ApiRequestWithSession } from "../../../lib/apiHelpers"
import { NextApiResponse } from "next"

import localForms from "../../../config/forms/forms.json";
import {mockForm} from "../../../fixtures/form"
import {mockClient} from "aws-sdk-client-mock";
import {GetObjectCommand, S3Client} from "@aws-sdk/client-s3";
import {Readable} from "stream";

const switchEnv = (environment) => {
  const oldEnv = process.env.NODE_ENV
  process.env.NEXT_PUBLIC_ENV = environment
  // @ts-ignore
  process.env.NODE_ENV = environment

  return () => switchEnv(oldEnv)
};

let response

describe("/api/content/forms", () => {
  beforeEach(() => {

    response = {
      status: jest.fn().mockImplementation(() => response),
      json: jest.fn(),
    } as unknown as NextApiResponse
  })

  describe('When under test', () => {
    let switchBack;

    beforeAll(() => switchBack = switchEnv("test"))
    afterAll(() => switchBack())

    it('returns mock forms', async () => {
      const request = {method: "GET"} as unknown as ApiRequestWithSession;

      await handler(request, response);

      expect(response.status).toHaveBeenCalledWith(200);
      expect(response.json).toHaveBeenCalledWith({forms: [mockForm]});
    });
  });

  describe('When in normal operation', () => {
    let switchBack;

    beforeAll(() => {
      switchBack = switchEnv("not-test");

      mockClient(S3Client).on(GetObjectCommand).resolves({
        Body: new Readable({
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          read(size: number) {
            this.push(JSON.stringify([mockForm, mockForm]));
            this.push(null)
          }
        })
      });
    });
    afterAll(() => switchBack());

    it('returns remotely stored forms', async () => {
      const request = {method: "GET"} as unknown as ApiRequestWithSession;

      await handler(request, response);

      expect(response.status).toHaveBeenCalledWith(200);
      expect(response.json).toHaveBeenCalledWith({ forms: [mockForm, mockForm] });
    });

    describe('When S3 is not usable', function () {
      const error = console.error;

      beforeAll(() => {
        mockClient(S3Client).on(GetObjectCommand).rejects();
        console.error = jest.fn();
      });

      afterAll(() => {
        console.error = error;
      })

      it('returns locally stored forms', async () => {
        const request = {method: "GET"} as unknown as ApiRequestWithSession;

        await handler(request, response);

        expect(response.status).toHaveBeenCalledWith(200);
        expect(response.json).toHaveBeenCalledWith({ forms: localForms });
        expect(console.error).toHaveBeenCalledWith(`[content][error] loading forms from local store: Error`);
      });
    });
  });

  describe('invalid HTTP methods', () => {
    ["POST", "PUT", "PATCH", "DELETE"].forEach(method => {
      it(`returns 405 for ${method}`, async () => {
        const request = {method: method} as unknown as ApiRequestWithSession;

        await handler(request, response);

        expect(response.status).toHaveBeenCalledWith(405);
        expect(response.json).toHaveBeenCalledWith({ error: "Method not supported on this endpoint" });
      });
    });
  });
});
