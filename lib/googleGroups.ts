import { NextApiRequest } from "next"
import allowedGroups, { pilotGroup } from "../config/allowedGroups"
import cookie from "cookie"
import jwt from "jsonwebtoken"

/** check if the logged in user is in any of the groups allowed to log in. ONLY WORKS ON A HACKNEY DOMAIN */
export const checkAuthorisedToLogin = async (
  req: NextApiRequest
): Promise<boolean> => {
  // if we're in local dev, allow any user
  if (process.env.NODE_ENV === "development") return true

  const GSSO_TOKEN_NAME = process.env.GSSO_TOKEN_NAME
  const HACKNEY_JWT_SECRET = process.env.HACKNEY_JWT_SECRET
  const cookies = cookie.parse(req.headers.cookie ?? "")

  try {
    const data = jwt.verify(cookies[GSSO_TOKEN_NAME], HACKNEY_JWT_SECRET)

    return data.groups.some(group => allowedGroups.includes(group))
  } catch (error) {
    console.error(`[auth][error] unable to authorise user: ${error}`)

    return false
  }
}

export const isInPilotGroup = async (cookieInReq: string): Promise<boolean> => {
  if (process.env.NODE_ENV !== "production") return true

  const GSSO_TOKEN_NAME = process.env.GSSO_TOKEN_NAME
  const HACKNEY_JWT_SECRET = process.env.HACKNEY_JWT_SECRET
  const cookies = cookie.parse(cookieInReq)

  try {
    const data = jwt.verify(cookies[GSSO_TOKEN_NAME], HACKNEY_JWT_SECRET)

    return data.groups.includes(pilotGroup)
  } catch (error) {
    console.error(
      `[auth][error] unable to determine user's Google Groups: ${error}`
    )

    return false
  }
}
