import { Team } from "@prisma/client"
import NextAuth from "next-auth"

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
