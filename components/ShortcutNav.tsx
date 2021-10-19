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
          <Link href={link.href} key={link.id}>
            <a className="lbh-link lbh-link--no-visited-state">
              <strong>{link.title}</strong>
              <span className="lbh-body-xs">{link?.description}</span>
            </a>
          </Link>
        ))}
      </nav>
    )

  return null
}

export default ShortcutNav
