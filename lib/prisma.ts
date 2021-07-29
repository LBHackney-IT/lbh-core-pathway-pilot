import { PrismaClient } from "@prisma/client"

let prisma: PrismaClient

// from: https://pris.ly/d/help/next-js-best-practices
if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient()
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient()
  }
  prisma = global.prisma
}

export default prisma
