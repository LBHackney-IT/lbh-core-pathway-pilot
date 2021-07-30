import NextAuth from "next-auth"
import Providers from "next-auth/providers"
import Adapters from "next-auth/adapters"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import prisma from "../../../lib/prisma"

const authHandler = (req, res) =>
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

    callbacks: {
      // restrict to hackney accounts
      async signIn(user, account, profile) {
        if (
          account.provider === "google" &&
          profile.verified_email === true &&
          profile.email.endsWith(process.env.ALLOWED_DOMAIN)
        ) {
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
