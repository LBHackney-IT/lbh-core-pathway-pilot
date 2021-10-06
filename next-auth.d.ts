import { Team, User as DBUser } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: {
      email?: string
      name?: string
      approver?: boolean
      panelApprover?: boolean
      team?: Team
      shortcuts: string[]
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface User extends DBUser {}
}
