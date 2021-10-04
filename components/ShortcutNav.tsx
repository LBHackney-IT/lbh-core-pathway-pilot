import Link from "next/link"
import s from "./ShortcutNav.module.scss"

const ShortcutNav = (): React.ReactElement => (
  <nav className={s.outer}>
    <Link href="/">
      <a className="lbh-link lbh-link--no-visited-state">
        <strong>Historic work</strong>
        <span className="lbh-body-xs">Submitted by you</span>
      </a>
    </Link>
    <Link href="/">
      <a className="lbh-link lbh-link--no-visited-state">
        <strong>Due soon</strong>
        <span className="lbh-body-xs">Review within 30 days</span>
      </a>
    </Link>
    <Link href="/">
      <a className="lbh-link lbh-link--no-visited-state">
        <strong>Shortcut goes here</strong>
        <span className="lbh-body-xs">Sub content</span>
      </a>
    </Link>
    <Link href="/">
      <a className="lbh-link lbh-link--no-visited-state">
        <strong>Shortcut goes here</strong>
        <span className="lbh-body-xs">Sub content</span>
      </a>
    </Link>
  </nav>
)

export default ShortcutNav
