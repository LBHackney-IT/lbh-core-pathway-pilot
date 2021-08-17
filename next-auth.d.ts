import NextAuth from "next-auth"
import { Team } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: {
      email?: string
      name?: string
      approver?: boolean
      team: Team
    }
  }
}
