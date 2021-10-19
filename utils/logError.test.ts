import logError from "./logError"
import { Prisma } from "@prisma/client"

const consoleError = console.error

beforeEach(() => (console.error = jest.fn()))
afterAll(() => (console.error = consoleError))

describe("when an error is thrown by Prisma", () => {
  it("outputs the error stack prefixed with [prisma][error] if PrismaClientKnownRequestError", () => {
    const error = new Prisma.PrismaClientKnownRequestError(
      "error message",
      "code",
      "clientVersion"
    )
    error.stack = "stack"

    logError(error)

    expect(console.error).toHaveBeenCalledWith('[prisma][error] "stack"')
  })

  it("outputs the error stack prefixed with [prisma][error] if PrismaClientUnknownRequestError", () => {
    const error = new Prisma.PrismaClientUnknownRequestError(
      "error message",
      "clientVersion"
    )
    error.stack = "stack"

    logError(error)

    expect(console.error).toHaveBeenCalledWith('[prisma][error] "stack"')
  })

  it("outputs the error stack prefixed with [prisma][error] if PrismaClientRustPanicError", () => {
    const error = new Prisma.PrismaClientRustPanicError(
      "error message",
      "clientVersion"
    )
    error.stack = "stack"

    logError(error)

    expect(console.error).toHaveBeenCalledWith('[prisma][error] "stack"')
  })

  it("outputs the error stack prefixed with [prisma][error] if PrismaClientInitializationError", () => {
    const error = new Prisma.PrismaClientInitializationError(
      "error message",
      "code",
      "clientVersion"
    )
    error.stack = "stack"

    logError(error)

    expect(console.error).toHaveBeenCalledWith('[prisma][error] "stack"')
  })

  it("outputs the error stack prefixed with [prisma][error] if PrismaClientValidationError", () => {
    const error = new Prisma.PrismaClientValidationError("error message")
    error.stack = "stack"

    logError(error)

    expect(console.error).toHaveBeenCalledWith('[prisma][error] "stack"')
  })
})

describe("when the error is unknown", () => {
  it("outputs the error stack prefixed with [api][error]", () => {
    const error = new Error("error message")
    error.stack = "stack"

    logError(error)

    expect(console.error).toHaveBeenCalledWith('[api][error] "stack"')
  })
})
