import { Prisma } from ".prisma/client"
import { useState } from "react"
import useQueryState from "../hooks/useQueryState"
import { prettyDateToNow } from "../lib/formatters"
import s from "./Comments.module.scss"

const commentWithCreator = Prisma.validator<Prisma.CommentArgs>()({
  include: {
    creator: true,
  },
})
export type CommentWithCreator = Prisma.CommentGetPayload<
  typeof commentWithCreator
>

interface Props {
  comments: CommentWithCreator[]
}

const Comments = ({ comments }: Props): React.ReactElement | null => {
  const [open, setOpen] = useQueryState<boolean>("comments", false)

  if (comments?.length > 0)
    return (
      <aside className="govuk-!-margin-bottom-7">
        <button
          className="lbh-link lbh-body-s"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? "Hide" : "Show"} comments ({comments.length})
        </button>

        {open && (
          <ul className="lbh-list govuk-!-margin-top-4">
            {comments.map(comment => (
              <li key={comment.id} className={s.comment}>
                <p>{comment.text}</p>
                <p className="lbh-body-xs">
                  {comment.creator.name} ·{" "}
                  {prettyDateToNow(String(comment.createdAt))}
                </p>
              </li>
            ))}
          </ul>
        )}
      </aside>
    )

  return null
}

export default Comments
