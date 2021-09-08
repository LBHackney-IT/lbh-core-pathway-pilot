import { NextApiRequest } from "next"
import allowedGroups from "../config/allowedGroups"
import cookie from "cookie"
import jwt from "jsonwebtoken"

/** check if the logged in user is in any of the groups allowed to log in. ONLY WORKS ON A HACKNEY DOMAIN */
export const checkAuthorisedToLogin = async (
  req: NextApiRequest
): Promise<boolean> => {
  const GSSO_TOKEN_NAME = process.env.GSSO_TOKEN_NAME
  const HACKNEY_JWT_SECRET = process.env.HACKNEY_JWT_SECRET

  const cookies = cookie.parse(req.headers.cookie ?? "")
  const data = cookies[GSSO_TOKEN_NAME]
    ? jwt.verify(cookies[GSSO_TOKEN_NAME], HACKNEY_JWT_SECRET)
    : null

  return data?.groups?.some(group => allowedGroups.includes(group))
}
