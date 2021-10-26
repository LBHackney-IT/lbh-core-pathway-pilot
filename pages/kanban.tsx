import Layout from "../components/_Layout"

const IndexPage = (): React.ReactElement => {
  return (
    <Layout
      fullWidth
      title="Workflows"
      breadcrumbs={[
        {
          href: process.env.NEXT_PUBLIC_SOCIAL_CARE_APP_URL,
          text: "My workspace",
        },
        { text: "Workflows", href: "/" },
        { text: "Kanban", current: true },
      ]}
    >
      <div className="lbh-container lmf-full-width">
        <h1 className="govuk-!-margin-bottom-6">Workflow board</h1>
      </div>
    </Layout>
  )
}

// export const getServerSideProps: GetServerSideProps = protectRoute()

export default IndexPage
