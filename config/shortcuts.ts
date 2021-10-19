import { Shortcut } from "../types"
import mockShortcuts from "../fixtures/shortcuts"

const shortcuts: Shortcut[] = [
  // TODO: when we have some shortcuts, let's add them
]

/** if this is cypress, return a fixture instead */
const shortcutsForThisEnv: Shortcut[] =
  process.env.NEXT_PUBLIC_ENV === "test" || process.env.NODE_ENV === "test"
    ? mockShortcuts
    : shortcuts

export default shortcutsForThisEnv
