import { useSession } from "next-auth/client"
import Link from "next/link"
import s from "./ShortcutNav.module.scss"
import shortcutOptions from "../config/shortcuts"

const ShortcutNav = (): React.ReactElement => {
  const [session] = useSession()

  const linksToShow = session?.user?.shortcuts
    ?.map(shortcutId =>
      shortcutOptions.find(option => option.id === shortcutId)
    )
    .filter(el => el)

  if (linksToShow.length > 0)
    return (
      <nav className={s.outer}>
        {linksToShow.map(link => (
          <a
            href={link.href}
            key={link.id}
            className="lbh-link lbh-link--no-visited-state"
          >
            <strong>{link.title}</strong>
            <span className="lbh-body-xs">{link?.description}</span>
          </a>
        ))}

        {linksToShow.length < 3 && (
          <Link href="/profile">
            <a className={`lbh-link lbh-link--no-visited-state ${s.new}`}>
              <span className="govuk-visually-hidden">
                Add another shortcut
              </span>
              <svg
                width="22"
                height="22"
                viewBox="0 0 22 22"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9.45283 9.45291V0.452637H12.9528V9.45291H21.9529V12.9529H12.9528V21.9526H9.45284V12.9529H0.452881V9.45291H9.45283Z"
                  fill="#DEE0E2"
                />
              </svg>
            </a>
          </Link>
        )}
      </nav>
    )

  return null
}

export default ShortcutNav
