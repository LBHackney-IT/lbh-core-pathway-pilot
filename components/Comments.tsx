import { Prisma, Action } from ".prisma/client"
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

const prettyAction = action => {
  if (action === Action.Approved) return "Approved"
  if (action === Action.ReturnedForEdits || action === Action.Edited)
    return "Changes requested"
}

const Comments = ({ comments }: Props): React.ReactElement | null => {
  const [open, setOpen] = useQueryState<boolean>("comments", true)

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

                <p className={s.meta}>
                  {comment.action === Action.Approved ? (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className={s.tick}
                    >
                      <circle cx="10" cy="10" r="10" fill="#525A5B" />
                      <path
                        d="M15.5 6.5L8.5 13.5L5 10"
                        stroke="white"
                        strokeWidth="3"
                      />
                    </svg>
                  ) : (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className={s.cross}
                    >
                      <circle cx="10" cy="10" r="10" fill="#525A5B" />
                      <path
                        d="M11.5278 12.5427H8.47222L8 3H12L11.5278 12.5427ZM8.03704 16.0733C8.03704 15.4613 8.2037 14.9872 8.53704 14.651C8.87037 14.308 9.35494 14.1365 9.99074 14.1365C10.6204 14.1365 11.0957 14.308 11.4167 14.651C11.7438 14.9872 11.9074 15.4613 11.9074 16.0733C11.9074 16.6785 11.7377 17.1527 11.3981 17.4956C11.0648 17.8319 10.5957 18 9.99074 18C9.37963 18 8.90123 17.8319 8.55556 17.4956C8.20988 17.1527 8.03704 16.6785 8.03704 16.0733Z"
                        fill="white"
                      />
                    </svg>
                  )}
                  {prettyAction(comment.action)} by {comment.creator.name} ·{" "}
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
