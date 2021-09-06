import { Prisma } from ".prisma/client"
import nextStepOptions from "../config/nextSteps/nextStepOptions"
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

const NextStepsSummary = ({ workflow }: Props): React.ReactElement | null => {
  if (workflow?.nextSteps?.length > 0)
    return (
      <section>
        <h2 className={`${s.heading} lbh-heading-h3`}>Next steps</h2>

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

  return null
}

export default NextStepsSummary
