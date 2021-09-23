import { formsForThisEnv } from "./index"
import { mockForm } from "../../fixtures/form"
import forms from "./forms.json"

const switchEnv = (environment) => {
  const oldEnv = process.env.NODE_ENV
  process.env.NEXT_PUBLIC_ENV = environment
  // @ts-ignore
  process.env.NODE_ENV = environment

  return () => switchEnv(oldEnv)
}

describe("When under test", () => {
  let switchBack;

  beforeAll(() => switchBack = switchEnv("test"))
  afterAll(() => switchBack())

  it("formsForThisEnv returns mockForm", () => {
    expect(formsForThisEnv()).toStrictEqual([mockForm])
  });
});

describe("When S3 is not contactable", () => {
  let switchBack;

  beforeAll(() => switchBack = switchEnv("prod"))
  afterAll(() => switchBack())

  it("formsForThisEnv returns forms.json", () => {
    expect(formsForThisEnv()).toStrictEqual(forms)
  });
});
