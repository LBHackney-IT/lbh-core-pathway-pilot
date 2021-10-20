import { Shortcut } from "../types"
import mockShortcuts from "../fixtures/shortcuts"

const shortcuts: Shortcut[] = [
  {
    id: "no-action-mine",
    title: "My historic work",
    description: "All authorised work started by me",
    href: "/?only_mine=true&status=NOACTION&tab=All",
  },
]

/** if this is cypress, return a fixture instead */
const shortcutsForThisEnv: Shortcut[] =
  process.env.NEXT_PUBLIC_ENV === "test" || process.env.NODE_ENV === "test"
    ? mockShortcuts
    : shortcuts

export default shortcutsForThisEnv
