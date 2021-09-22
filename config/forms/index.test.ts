import { formsForThisEnv } from "./index"
import { mockForm } from "../../fixtures/form"

describe("formsForThisEnv", () => {
  const switchEnv = (environment) => {
    const oldEnv = process.env.NEXT_PUBLIC_ENV
    process.env.NEXT_PUBLIC_ENV = environment

    return () => switchEnv(oldEnv)
  }

  it("returns mockForm if environment is test", () => {
    const switchBack = switchEnv("test")

    expect(formsForThisEnv()).toStrictEqual([mockForm])

    switchBack()
  })
})
