import { GetServerSideProps } from "next"
import Filters from "../components/NewDashboard/Filters"
import Layout from "../components/_Layout"
import useLocalStorage from "../hooks/useLocalStorage"
import useQueryParams from "../hooks/useQueryParams"
import { protectRoute } from "../lib/protectRoute"
import s from "../styles/LeftSidebar.module.scss"
import forms from "../config/forms"
import { Form } from "../types"

interface Props {
  forms: Form[]
}

const KanbanPage = ({ forms }: Props): React.ReactElement => {
  const [filterPanelOpen, setFilterPanelOpen] = useLocalStorage<boolean>(
    "filterPanelOpen",
    true
  )

  const [queryParams, updateQueryParams] = useQueryParams({
    page: 1,
  })

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
      <div className={`lbh-container lmf-full-width ${s.header}`}>
        <h1 className={`lbh-heading-h2 govuk-!-margin-bottom-3`}>Workflows</h1>
      </div>

      <div className={s.splitPanes}>
        {filterPanelOpen ? (
          <aside className={s.sidebarPane}>
            <Filters
              forms={forms}
              queryParams={queryParams}
              updateQueryParams={updateQueryParams}
            />
            <button onClick={() => setFilterPanelOpen(false)}>Hide</button>
          </aside>
        ) : (
          <button onClick={() => setFilterPanelOpen(true)}>Filters</button>
        )}

        <div className={s.mainPane}>
          <div className={s.mainContent}>Content here</div>
        </div>
      </div>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = protectRoute(async () => {
  const resolvedForms = await forms()

  return {
    props: {
      forms: resolvedForms,
    },
  }
})

export default KanbanPage
