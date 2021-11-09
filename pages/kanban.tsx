import { GetServerSideProps } from "next"
import Filters from "../components/NewDashboard/Filters"
import Layout from "../components/_Layout"
import useLocalStorage from "../hooks/useLocalStorage"
import useQueryParams from "../hooks/useQueryParams"
import { protectRoute } from "../lib/protectRoute"
import s from "../styles/LeftSidebar.module.scss"
import forms from "../config/forms"
import { Form, Status } from "../types"
import KanbanColumn from "../components/NewDashboard/KanbanColumn"

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
        <h1 className={`lbh-heading-h2`}>Workflows</h1>
      </div>

      <div className={s.splitPanes}>
        {filterPanelOpen ? (
          <aside className={s.sidebarPaneCollapsible}>
            <Filters
              forms={forms}
              queryParams={queryParams}
              updateQueryParams={updateQueryParams}
            />
            <button
              className={s.collapseButton}
              onClick={() => setFilterPanelOpen(false)}
            >
              <svg width="10" height="13" viewBox="0 0 10 13" fill="none">
                <path d="M8 2L3 7L8 12" stroke="#0B0C0C" strokeWidth="2" />
              </svg>
              Hide
            </button>
          </aside>
        ) : (
          <button
            className={s.expandButton}
            onClick={() => setFilterPanelOpen(true)}
          >
            Show filters
            <svg width="10" height="16" viewBox="0 0 10 14" fill="none">
              <path d="M2 12L7 7L2 2" stroke="#0B0C0C" strokeWidth="2" />
            </svg>
          </button>
        )}

        <div className={s.mainPane}>
          <div className={s.mainContent}>
            <KanbanColumn status={Status.InProgress} />
            <KanbanColumn status={Status.Submitted} />
            <KanbanColumn status={Status.ManagerApproved} />
          </div>
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
