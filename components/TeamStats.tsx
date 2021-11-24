import { Team } from "@prisma/client"
import useTeamKpis from "../hooks/useKpis"
import s from "./TeamStats.module.scss"

interface Props {
  team: Team
}

interface StatProps {
  data: number
  previousData?: number
  caption: string
}

const Stat = ({ data, previousData, caption }: StatProps) => (
  <div className={`lbh-stat ${s.stat}`}>
    <strong className="lbh-stat__value" aria-labelledby={`${caption}-caption`}>
      {data || <span className={s.placeholder}>??</span>}

      {previousData ? (
        <>
          {previousData < data && (
            <div title="More than the previous 30 days">
              <svg width="34" height="35" viewBox="0 0 34 35" fill="none">
                <path
                  d="M2.44365 18.5563L17 4L31.5563 18.5563"
                  stroke="#00B140"
                  strokeWidth="5"
                />
                <path d="M17 5L17 35" stroke="#00B140" strokeWidth="5" />
              </svg>
            </div>
          )}
          {previousData > data && (
            <div title="Less than the previous 30 days">
              <svg width="33" height="35" viewBox="0 0 33 35" fill="none">
                <path
                  d="M31.1127 16.4437L16.5563 31L2 16.4437"
                  stroke="#BE3A34"
                  strokeWidth="5"
                />
                <path
                  d="M16.5563 30L16.5563 9.83477e-07"
                  stroke="#BE3A34"
                  strokeWidth="5"
                />
              </svg>
            </div>
          )}
        </>
      ) : (
        ""
      )}
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
      <Stat
        data={kpis?.last30Days?.started}
        previousData={kpis?.prev30Days?.started}
        caption="workflows started"
      />
      <Stat
        data={kpis?.last30Days?.submitted}
        previousData={kpis?.prev30Days?.submitted}
        caption="workflows submitted"
      />
      <Stat
        data={kpis?.last30Days?.completed}
        previousData={kpis?.prev30Days?.completed}
        caption="workflows approved"
      />
      <Stat
        data={kpis?.last30Days?.turnaroundTime}
        caption="average days to approve a workflow"
      />
    </div>
  )
}

export default TeamStats
