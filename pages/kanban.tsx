import Filters from "../components/NewDashboard/Filters"
import Layout from "../components/_Layout"
import useLocalStorage from "../hooks/useLocalStorage"
import s from "../styles/LeftSidebar.module.scss"

const KanbanPage = (): React.ReactElement => {
  const [filterPanelOpen, setFilterPanelOpen] = useLocalStorage<boolean>(
    "filterPanelOpen",
    true
  )

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
            <Filters />
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

export default KanbanPage
