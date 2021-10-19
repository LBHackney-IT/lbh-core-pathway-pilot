import { Prisma } from "@prisma/client"

const logError = (error: Error): void => {
  if (
    error instanceof Prisma.PrismaClientUnknownRequestError ||
    error instanceof Prisma.PrismaClientRustPanicError ||
    error instanceof Prisma.PrismaClientKnownRequestError ||
    error instanceof Prisma.PrismaClientValidationError ||
    error instanceof Prisma.PrismaClientInitializationError
  ) {
    console.error(`[prisma][error] ${JSON.stringify(error.stack)}`)
  } else {
    console.error(`[api][error] ${JSON.stringify(error.stack)}`)
  }
}

export default logError
