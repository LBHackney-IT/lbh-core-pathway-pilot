import React from "react"
import s from "./KanbanCardSkeleton.module.scss"

const KanbanCardSkeleton = (): React.ReactElement => (
  <div className={s.skeleton}>
    <div className={s.title}></div>

    <div className={s.meta}></div>
    <div className={s.meta}></div>

    <div className={s.footer}>
      <div className={s.label}></div>
      <div className={s.circle}></div>
    </div>
  </div>
)

const Skeleton = (): React.ReactElement => (
  <div aria-label="loading...">
    <KanbanCardSkeleton />
    <KanbanCardSkeleton />
  </div>
)

export default Skeleton
