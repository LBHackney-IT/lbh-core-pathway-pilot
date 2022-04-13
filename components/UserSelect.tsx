import { User } from ".prisma/client"
import { useMemo } from "react"
import { prettyTeamNames } from "../config/teams"

interface Props {
  users: User[]
  default?: {
    label: string
    value: string
  }
}

const UserOptions = ({
  users,
  default: { label, value } = { label: "", value: "" },
}: Props): React.ReactElement => {
  let usersByTeam: { [key: string]: User[] } = useMemo(
    () =>
      users?.reduce((acc, user) => {
        if (acc[user.team]) {
          acc[user.team].push(user)
        } else {
          acc[user.team] = [user]
        }
        return acc
      }, {}),
    [users]
  )

  if (usersByTeam)
    usersByTeam = Object.fromEntries(Object.entries(usersByTeam).sort())

  if (users && usersByTeam)
    return (
      <>
        <option value={value}>{label}</option>
        {usersByTeam &&
          Object.entries(usersByTeam).map(([team, users]) => (
            <optgroup label={prettyTeamNames[team] || "No team"} key={team}>
              {users.map(opt => (
                <option key={opt.id} value={opt.email}>
                  {opt.name || opt.email}
                </option>
              ))}
            </optgroup>
          ))}
      </>
    )

  return null
}

export default UserOptions
