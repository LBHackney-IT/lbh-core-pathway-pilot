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
      <h1>Are their personal details still correct?</h1>
      <p>You need to confirm these before starting a workflow.</p>

      <dl className="govuk-summary-list lbh-summary-list">
        {Object.entries(resident)
          .filter(row => row[1])
          .map(([key, value]) => (
            <div className="govuk-summary-list__row" key={key}>
              <dt className="govuk-summary-list__key">{key}</dt>
              <dd className="govuk-summary-list__value">
                {JSON.stringify(value)}
              </dd>
            </div>
          ))}
      </dl>

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
