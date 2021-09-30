import NextAuth from "next-auth"
import Providers from "next-auth/providers"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import prisma from "../../../lib/prisma"
import { NextApiRequest, NextApiResponse } from "next"
import { Team } from "@prisma/client"
import { checkAuthorisedToLogin } from "../../../lib/googleGroups"

const authHandler = (
  req: NextApiRequest,
  res: NextApiResponse
): void | Promise<void> =>
  NextAuth(req, res, {
    providers: [
      Providers.Google({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      }),
    ],

    pages: {
      signIn: "/sign-in",
    },

    session: {
      maxAge: 3 * 60 * 60,
      updateAge: 60 * 60,
    },

    callbacks: {
      // include extra info in the session object
      async session(session, user) {
        session.user.approver = !!user.approver
        session.user.panelApprover = !!user.panelApprover
        session.user.team = user.team as Team
        return session
      },

      // restrict to hackney accounts
      async signIn(user, account, profile) {
        if (
          account.provider === "google" &&
          profile.verified_email === true &&
          profile.email.endsWith(process.env.ALLOWED_DOMAIN)
        ) {
          // TODO: uncomment this when we're on a hackney domain
          return await checkAuthorisedToLogin(req)
          return true
        } else {
          return false
        }
      },
    },
    adapter: PrismaAdapter(prisma),
    secret: process.env.SESSION_SECRET,
  })

export default authHandler
