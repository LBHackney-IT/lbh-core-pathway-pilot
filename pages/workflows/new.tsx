import { GetServerSideProps } from "next"
import { useRouter } from "next/router"
import WarningPanel from "../../components/WarningPanel"
import Layout from "../../components/_Layout"
import { getResidentById, Resident } from "../../lib/residents"
import s from "../../components/WarningPanel.module.scss"
import ResidentDetailsList from "../../components/ResidentDetailsList"

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
      title="Are the personal details correct?"
      breadcrumbs={[
        { href: "/", text: "Home" },
        {
          href: `${process.env.NEXT_PUBLIC_SOCIAL_CARE_APP_URL}/people/${resident.mosaicId}`,
          text: `${resident.firstName} ${resident.lastName}`,
        },
        { current: true, text: "New workflow" },
      ]}
    >
      <WarningPanel>
        <h1 className="lbh-heading-h2">
          Are their personal details still correct?
        </h1>
        <p>You need to confirm these before starting a workflow.</p>

        <ResidentDetailsList resident={resident} />

        <div className={s.twoActions}>
          <button className="govuk-button lbh-button" onClick={handleSubmit}>
            Yes, they are correct
          </button>
          <a
            href={`${process.env.NEXT_PUBLIC_SOCIAL_CARE_APP_URL}/people/${resident.mosaicId}/edit`}
          >
            No, amend
          </a>
        </div>
      </WarningPanel>
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
