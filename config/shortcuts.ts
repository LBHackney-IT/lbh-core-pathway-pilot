import { Shortcut } from "../types"
import mockShortcuts from "../fixtures/shortcuts"

const shortcuts: Shortcut[] = [
  {
    id: "no-action-mine",
    title: "My authorised work",
    description: "All QAM authorised work started by me",
    href: "/?only_mine=true&status=NOACTION&tab=All",
  },

  {
    id: "manager-approved-mine",
    title: "My approved work",
    description: "All manager approved work started by me",
    href: "/?only_mine=true&status=MANAGERAPPROVED&tab=All",
  },

  {
    id: "manager-approved-mine",
    title: "My submitted work",
    description: "All work started by me that has been submitted for approval",
    href: "/?only_mine=true&status=SUBMITTED&tab=All",
  },
]

/** if this is cypress, return a fixture instead */
const shortcutsForThisEnv: Shortcut[] =
  process.env.NEXT_PUBLIC_ENV === "test" || process.env.NODE_ENV === "test"
    ? mockShortcuts
    : shortcuts

export default shortcutsForThisEnv
