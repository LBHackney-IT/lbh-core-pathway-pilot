import { useSession } from "next-auth/client"
import { useState } from "react"
import useAllocations from "../hooks/useAllocations"
import {
  prettyDate,
  prettyDateToNow,
  prettyResidentName,
} from "../lib/formatters"
import { prettyStatus } from "../lib/status"
import { UserForTeamPage } from "../pages/teams/[id]"
import EditUserDialog from "./EditUserDialog"
import s from "./TeamMemberList.module.scss"
import Link from "next/link"
import useResident from "../hooks/useResident"
import { Workflow } from "@prisma/client"
import { Form } from "../types"
import forms from "../pages/api/content/forms"

interface AssignmentProps {
  workflow: Workflow
  forms: Form[]
}

const Assignment = ({ workflow, forms }: AssignmentProps) => {
  const { data: resident } = useResident(workflow.socialCareId)

  const form = forms.find(form => form.id === workflow.formId)

  return (
    <li>
      <strong>
        <Link href={`/workflows/${workflow.id}`}>
          <a>
            {form ? form.name : workflow.formId} for{" "}
            {resident
              ? prettyResidentName(resident)
              : `#${workflow.socialCareId}`}
          </a>
        </Link>
      </strong>
      <p className="lbh-body-xs lmf-grey">
        {prettyStatus(workflow)} · Started{" "}
        {prettyDate(workflow.createdAt.toString())}
      </p>
    </li>
  )
}

interface Props {
  user: UserForTeamPage
  forms: Form[]
}

const TeamMemberPanel = ({ user, forms }: Props): React.ReactElement => {
  const [session] = useSession()
  const me = user.email === session?.user?.email

  const [expanded, setExpanded] = useState<boolean>(false)

  // const { data: allocations } = useAllocations(user.email)

  // const assignmentsByAllocation = user.assignments.reduce((acc, assignment) => {
  //   if (!acc[assignment.socialCareId]) {
  //     acc[assignment.socialCareId] = assignment
  //     return acc
  //   } else {
  //   }
  // }, {})

  const lastSeen = user.sessions?.[0]?.updatedAt

  return (
    <section key={user.id} aria-expanded={expanded} className={s.section}>
      <header className={s.header}>
        <div className={s.identity}>
          <img src={user.image} alt="" className={s.image} />

          <div>
            <button onClick={() => setExpanded(!expanded)} className={s.button}>
              <h3 className="lbh-heading-h4">
                {user.name}
                {me && ` (you)`}
              </h3>
            </button>

            <p className="lbh-body-xs lmf-grey govuk-!-margin-top-1">
              {user.panelApprover
                ? "QAM authoriser"
                : user.approver
                ? "Approver"
                : "User"}{" "}
              {lastSeen &&
                `· Last seen ${prettyDateToNow(lastSeen.toString())}`}{" "}
              {session.user.approver && (
                <>
                  · <EditUserDialog user={user} />
                </>
              )}
            </p>
          </div>
        </div>

        <dl className={s.stats}>
          <div>
            <dd>
              Not known
              {/* {allocations ? allocations.length : ""} */}
            </dd>
            <dt>allocations</dt>
          </div>

          <div>
            <dd>{user.assignments.length}</dd>
            <dt>workflow{user.assignments.length !== 1 && "s"} assigned</dt>
          </div>
        </dl>

        <svg
          width="20"
          height="20"
          viewBox="0 0 13 9"
          fill="none"
          className={s.icon}
        >
          <path
            d="M1.5 1.5L6.5 6.5L11.5 1.5"
            stroke="#0B0C0C"
            strokeWidth="2"
          />
        </svg>
      </header>

      {expanded && (
        <div className={s.workPanel}>
          <ul className="lbh-list">
            {user.assignments.length > 0 ? (
              user.assignments.map(workflow => (
                <Assignment
                  key={workflow.id}
                  workflow={workflow}
                  forms={forms}
                />
              ))
            ) : (
              <p className="lbh-body-s lmf-grey">
                This user has no assignments.
              </p>
            )}
          </ul>

          {/* {allocations?.map(allocation => (
            <div key={allocation.person_id}>
              <h4>{allocation.person_name}</h4>

              <ul className="lbh-list">
                {user.assignments
                  .filter(
                    workflow => workflow.socialCareId === allocation.person_id
                  )
                  .map(workflow => (
                    <li key={workflow.id}>
                      <strong>
                        <Link href={`/workflows/${workflow.id}`}>
                          {workflow.formId}
                        </Link>
                      </strong>
                      <p>
                        {getStatus(workflow)}·{" "}
                        {prettyDate(workflow.createdAt.toString())}
                      </p>
                    </li>
                  ))}
              </ul>
            </div>
          ))} */}
        </div>
      )}
    </section>
  )
}

export default TeamMemberPanel
