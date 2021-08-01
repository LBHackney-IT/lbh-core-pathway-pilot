import { GetServerSideProps } from "next"
import { useRouter } from "next/router"
import Layout from "../../components/_Layout"
import { getResidentById, Resident } from "../../lib/residents"

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
    <Layout title="Are the personal details correct?">
      <h1>Are their personal details correct?</h1>
      {JSON.stringify(resident)}
      <button className="govuk-button lbh-button" onClick={handleSubmit}>
        Yes, they are correct
      </button>
      <a href="#">No, amend</a>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const { social_care_id } = query

  const resident = await getResidentById(social_care_id as string)

  return {
    props: {
      ...resident,
    },
  }
}

export default NewWorkflowPage
