import { Prisma } from ".prisma/client"
import nextStepOptions from "../config/nextSteps/nextStepOptions"
import useLocalStorage from "../hooks/useLocalStorage"
import s from "./NextStepsSummary.module.scss"

const workflowForNextStepsSummary = Prisma.validator<Prisma.WorkflowArgs>()({
  include: {
    nextSteps: true,
  },
})
export type WorkflowForNextStepsSummary = Prisma.WorkflowGetPayload<
  typeof workflowForNextStepsSummary
>

interface Props {
  workflow: WorkflowForNextStepsSummary
}

const NextStepsSummary = ({ workflow }: Props): React.ReactElement => {
  const [open, setOpen] = useLocalStorage<boolean>("nextSteps", true)

  return (
    <section className="lbh-collapsible govuk-!-margin-bottom-8">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="lbh-collapsible__button"
      >
        <h2 className="lbh-heading-h3 lbh-collapsible__heading">Next steps</h2>
        <svg
          className="down-arrow-icon"
          xmlns="http://www.w3.org/2000/svg"
          x="0px"
          y="0px"
          width="284.929px"
          height="284.929px"
          viewBox="0 0 284.929 284.929"
        >
          <g>
            <path
              fill="#0B0C0C"
              d="M282.082,76.511l-14.274-14.273c-1.902-1.906-4.093-2.856-6.57-2.856c-2.471,0-4.661,0.95-6.563,2.856L142.466,174.441
		L30.262,62.241c-1.903-1.906-4.093-2.856-6.567-2.856c-2.475,0-4.665,0.95-6.567,2.856L2.856,76.515C0.95,78.417,0,80.607,0,83.082
		c0,2.473,0.953,4.663,2.856,6.565l133.043,133.046c1.902,1.903,4.093,2.854,6.567,2.854s4.661-0.951,6.562-2.854L282.082,89.647
		c1.902-1.903,2.847-4.093,2.847-6.565C284.929,80.607,283.984,78.417,282.082,76.511z"
            />
          </g>
        </svg>
      </button>

      {open && (
        <table className="lbh-collapsible__content govuk-table lbh-table">
          <tbody className="govuk-table__body">
            {workflow.nextSteps.map(nextStep => (
              <tr className="govuk-table__row" key={nextStep.id}>
                <th className="govuk-table__cell" scope="row">
                  {
                    nextStepOptions.find(
                      o => o.id === nextStep.nextStepOptionId
                    )?.title
                  }
                </th>
                <td className="govuk-table__cell lbh-body-s">
                  {nextStep.note}
                  {nextStep.altSocialCareId && (
                    <>
                      <br />
                      For {nextStep.altSocialCareId}
                    </>
                  )}
                </td>
                <td className="govuk-table__cell govuk-table__cell--numeric">
                  {nextStep.triggeredAt ? (
                    <strong
                      className={`govuk-tag lbh-tag--green app-task-list__tag ${s.tagDone}`}
                    >
                      Done
                    </strong>
                  ) : (
                    <strong
                      className={`govuk-tag govuk-tag--grey app-task-list__tag ${s.tag}`}
                    >
                      Pending
                    </strong>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}

export default NextStepsSummary
