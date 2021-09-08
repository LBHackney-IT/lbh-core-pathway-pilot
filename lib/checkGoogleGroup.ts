import allowedGroups from "../config/allowedGroups"

/** check if the logged in user is in any of the groups allowed to log in. ONLY WORKS ON A HACKNEY DOMAIN */
export const checkAuthorisedToLogin = async (): Promise<boolean> => {
  const res = await fetch("https://auth.hackney.gov.uk/auth/check_token")
  const data = await res.json()

  return data.groups.some(group => allowedGroups.includes(group))
}
