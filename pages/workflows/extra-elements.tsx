import Layout from "../../components/_Layout"
import { useRouter } from "next/router"
import { Resident } from "../../types"
import { getResidentServerSide } from "../../lib/serverSideProps"

const NewWorkflowPage = (resident: Resident): React.ReactElement => {
  const { push } = useRouter()

  const handleSubmit = async () => {
    const res = await fetch(`/api/workflows`, {
      method: "POST",
      body: JSON.stringify({
        socialCareId: resident.mosaicId,
      }),
    })
    const workflow = await res.json()
    if (workflow.id) push(`/workflows/${workflow.id}`)
  }

  return (
    <Layout
      title="Extra assessment elements"
      breadcrumbs={[
        { href: "/", text: "Dashboard" },
        {
          href: `${process.env.NEXT_PUBLIC_SOCIAL_CARE_APP_URL}/people/${resident.mosaicId}`,
          text: `${resident.firstName} ${resident.lastName}`,
        },
        { current: true, text: "Check details" },
      ]}
    >
      {JSON.stringify(resident)}
      <h1>Do you want to add any extra assessment elements?</h1>
    </Layout>
  )
}

export const getServerSideProps = getResidentServerSide

export default NewWorkflowPage
