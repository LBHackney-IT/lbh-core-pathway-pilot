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
import { QuickFilterOpts, WorkflowQueryParams } from "../hooks/useWorkflows"
import DragToScroll from "../components/NewDashboard/DragToScroll"
import {useContext} from "react";
import {SessionContext} from "../lib/auth/SessionContext";

interface Props {
  forms: Form[]
}

const KanbanPage = ({ forms }: Props): React.ReactElement => {
  const session = useContext(SessionContext);
  const [filterPanelOpen, setFilterPanelOpen] = useLocalStorage<boolean>(
    "filterPanelOpen",
    true
  )

  const [queryParams, updateQueryParams] = useQueryParams<WorkflowQueryParams>({
    quick_filter: QuickFilterOpts.Me,
    touched_by_me: true,
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
        { text: "Workflows", current: true },
      ]}
    >
      <div className={`lbh-container lmf-full-width ${s.header}`}>
        <h1 className={`lbh-heading-h2`}>Planner</h1>

        <div className="lbh-header__links">
          <div>
            <p className="link-text-colour govuk-!-margin-right-5">Core pathway: </p>
          </div>
            <a href="/teams" className="lbh-link lbh-link--no-visited-state">Teams Performance</a>
          {session.approver && (
            <a href="/users" className="lbh-link lbh-link--no-visited-state">Users</a>
          )}
        </div>


      </div>

      <div className={s.splitPanes} aria-expanded={filterPanelOpen}>
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
            <div>
              Show filters
              <svg width="10" height="16" viewBox="0 0 10 14" fill="none">
                <path d="M2 12L7 7L2 2" stroke="#0B0C0C" strokeWidth="2" />
              </svg>
            </div>
          </button>
        )}

        <div className={s.mainPane}>
          <DragToScroll className={s.mainContent}>
            <div data-draggable className={s.columns}>
              <KanbanColumn
                queryParams={queryParams}
                status={Status.InProgress}
              />
              <KanbanColumn
                queryParams={queryParams}
                status={Status.Submitted}
              />
              <KanbanColumn
                queryParams={queryParams}
                status={Status.ManagerApproved}
              />
              <KanbanColumn
                queryParams={queryParams}
                status={Status.NoAction}
                order="desc"
              />
              <KanbanColumn
                queryParams={queryParams}
                status={Status.ReviewSoon}
                startOpen={false}
              >
                <p className="lbh-body-xs lmf-grey govuk-!-margin-bottom-1">
                  This list may be incomplete—check your team allocation
                  spreadsheet.
                </p>
              </KanbanColumn>
              <KanbanColumn
                queryParams={queryParams}
                status={Status.Overdue}
                startOpen={false}
              >
                <p className="lbh-body-xs lmf-grey govuk-!-margin-bottom-1">
                  This list may be incomplete—check your team allocation
                  spreadsheet.
                </p>
              </KanbanColumn>
            </div>
          </DragToScroll>
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
