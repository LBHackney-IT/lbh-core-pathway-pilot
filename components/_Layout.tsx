import Head from "next/head"
import { useRouter } from "next/router"
import { useSession, Provider } from "next-auth/client"
import Header from "../components/Header"

const PUBLIC_PATHS = ["/sign-in"]

interface Props {
  children: React.ReactElement
}

const App = ({ children }: Props): React.ReactElement => {
  const [session, isLoading] = useSession()
  const { pathname, replace } = useRouter()

  if (session || PUBLIC_PATHS.includes(pathname)) return children

  if (!session && !isLoading) replace(`/sign-in`)

  return <p>Loading...</p>
}

export default App
