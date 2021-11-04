import NextAuth from "next-auth"
import Providers from "next-auth/providers"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import prisma from "../../../lib/prisma"
import { NextApiRequest, NextApiResponse } from "next"
import { Team, User } from "@prisma/client"
import {
  checkAuthorisedToLogin,
  isInPilotGroup,
} from "../../../lib/googleGroups"

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
      error: "/403",
    },

    session: {
      maxAge: 3 * 60 * 60,
      updateAge: 60 * 60,
    },

    callbacks: {
      // include extra info in the session object
      async session(session, user: User) {
        session.user.inPilot = await isInPilotGroup(req.headers.cookie)
        session.user.approver = !!user.approver
        session.user.panelApprover = !!user.panelApprover
        session.user.team = user.team as Team
        session.user.shortcuts = user.shortcuts

        return session
      },

      async signIn(user, account, profile) {
        if (
          profile.verified_email === false ||
          !profile.email.endsWith(process.env.ALLOWED_DOMAIN) ||
          !(await checkAuthorisedToLogin(req))
        ) {
          return false
        } else {
          const firstTimeUser = !user.createdAt
          if (firstTimeUser) {
            const historicUserWithoutAccount = await prisma.user.findFirst({
              where: {
                email: user.email,
                accounts: { none: {} },
                historic: true,
              },
            })

            if (historicUserWithoutAccount) {
              await prisma.user.update({
                where: {
                  id: historicUserWithoutAccount.id
                },
                data: {
                  name: profile.name,
                  image: profile.picture,
                  historic: false,
                  accounts: {
                    create: {
                      providerType: account.type,
                      providerId: account.provider,
                      providerAccountId: account.id,
                      refreshToken: account.refreshToken,
                      accessToken: account.access_token,
                      accessTokenExpires: account.accessTokenExpires,
                      autoLinkedToUser: true,
                    }
                  },
                },
              })
            }
          }

          return true
        }
      },
    },

    adapter: PrismaAdapter(prisma),
    secret: process.env.SESSION_SECRET,
  })

export default authHandler
