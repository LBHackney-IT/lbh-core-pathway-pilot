import { asyncFormsForThisEnv } from "./index"
import { mockForm } from "../../fixtures/form"
import forms from "./forms.json"
import {mockClient} from 'aws-sdk-client-mock';
import {S3Client, GetObjectCommand} from "@aws-sdk/client-s3";
import {Readable} from "stream";

const switchEnv = (environment) => {
  const oldEnv = process.env.NODE_ENV
  process.env.NEXT_PUBLIC_ENV = environment
  // @ts-ignore
  process.env.NODE_ENV = environment

  return () => switchEnv(oldEnv)
};

describe("When under test", () => {
  let switchBack;

  beforeAll(() => switchBack = switchEnv("test"))
  afterAll(() => switchBack())

  test("asyncFormsForThisEnv returns mockForm", async () => {
    expect(await asyncFormsForThisEnv()).toStrictEqual([mockForm])
  });
});

describe("When in production", () => {
  let switchBack;

  beforeAll(() => {
    switchBack = switchEnv("prod");

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

  test("asyncFormsForThisEnv returns a result from S3", async () => {
    expect(await asyncFormsForThisEnv()).toStrictEqual([mockForm, mockForm])
  });

  describe("When S3 is not contactable", () => {
    beforeAll(() => {
      mockClient(S3Client).on(GetObjectCommand).rejects();
    });

    test("asyncFormsForThisEnv returns forms.json", async () => {
      expect(await asyncFormsForThisEnv()).toStrictEqual(forms)
    });
  });
});

