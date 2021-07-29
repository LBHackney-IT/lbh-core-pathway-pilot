import { useSession } from "next-auth/client"

const IndexPage = () => {
  const [session, loading] = useSession()

  return <p>{JSON.stringify(session)}</p>
}

export default IndexPage
