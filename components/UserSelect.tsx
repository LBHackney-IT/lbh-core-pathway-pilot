import { User } from ".prisma/client"
import { useMemo } from "react"
import { prettyTeamNames } from "../config/teams"

interface Props {
  users: User[]
}

const UserOptions = ({ users }: Props): React.ReactElement => {
  const usersByTeam: { [key: string]: User[] } = useMemo(
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

  if (users && usersByTeam)
    return (
      <>
        {usersByTeam &&
          Object.entries(usersByTeam).map(([team, users]) => (
            <optgroup label={prettyTeamNames[team] || "No team"} key={team}>
              {users.map(opt => (
                <option key={opt.id} value={opt.email}>
                  {opt.name}
                </option>
              ))}
            </optgroup>
          ))}
      </>
    )

  return null
}

export default UserOptions
