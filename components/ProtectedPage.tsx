import { useRouter } from "next/router"
import { useSession } from "next-auth/client"
import FullPageSpinner from "./FullPageSpinner"

const PUBLIC_PATHS = ["/sign-in", "/404", "/403", "/500"]

interface Props {
  children: React.ReactElement
}

const ProtectedPage = ({ children }: Props): React.ReactElement => {
  const [session, isLoading] = useSession()
  const { pathname, replace } = useRouter()

  if (session || PUBLIC_PATHS.includes(pathname)) return children

  if (!session && !isLoading) replace(`/sign-in`)

  return <FullPageSpinner />
}

export default ProtectedPage
