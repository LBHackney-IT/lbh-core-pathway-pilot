import { Team } from "@prisma/client"
import useTeamKpis from "../hooks/useKpis"
import s from "./TeamStats.module.scss"

interface Props {
  team: Team
}

const Stat = ({ data, caption }) => (
  <div className={`lbh-stat ${s.stat}`}>
    <strong className="lbh-stat__value" aria-labelledby={`${caption}-caption`}>
      {data || <span className={s.placeholder}>??</span>}
    </strong>
    <span className="lbh-stat__caption" id={`${caption}-caption`}>
      {caption}
    </span>
  </div>
)

const TeamStats = ({ team }: Props): React.ReactElement => {
  const { data: kpis } = useTeamKpis(team)

  return (
    <div className={s.columns}>
      <Stat data={kpis?.last30Days?.started} caption="workflows started" />
      <Stat data={kpis?.last30Days?.submitted} caption="workflows submitted" />
      <Stat data={kpis?.last30Days?.completed} caption="workflows approved" />
      <Stat
        data={kpis?.last30Days?.turnaroundTime}
        caption="average days to approve a workflow"
      />
    </div>
  )
}

export default TeamStats
