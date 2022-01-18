import Dialog from "./Dialog"
import { useState } from "react"
import { Workflow, WorkflowType } from "@prisma/client"
import { Form, Formik } from "formik"
import Link from "next/link"
import { prettyDate } from "../lib/formatters"
import { Form as IForm } from "../types"
import SelectField from "./FlexibleForms/SelectField"
import { csrfFetch } from "../lib/csrfToken"
import { useRouter } from "next/router"
import useWorkflowsByResident from "../hooks/useWorkflowsByResident"

interface Props {
  workflow: Workflow
  forms: IForm[]
}

const EpisodeDialog = ({ workflow, forms }: Props): React.ReactElement => {
  const { push } = useRouter()
  const [open, setOpen] = useState<boolean>(false)
  const { data: linkableWorkflows } = useWorkflowsByResident(
    workflow.socialCareId
  )
  const isLinked = !!workflow.workflowId
  const isReassessment = workflow.type === WorkflowType.Reassessment

  const workflowChoices = [
    {
      value: "",
      label: "None - start a new episode",
    },
  ].concat(
    linkableWorkflows?.workflows?.map(linkableWorkflow => ({
      label: `${
        forms?.find(form => form.id === linkableWorkflow.formId)?.name
      } (last edited ${prettyDate(String(linkableWorkflow.createdAt))})`,
      value: linkableWorkflow.id,
    })) || []
  )

  const handleSubmit = async (values, { setStatus }) => {
    try {
      const res = await csrfFetch(`/api/workflows/${workflow.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          workflowId: values.workflowId || null,
        }),
      })
      if (res.status !== 200) throw res.statusText
      setOpen(false)
      push(`/workflows/${workflow.id}`)
    } catch (e) {
      setStatus(e.toString())
    }
  }

  return (
    <>
      <p className="lbh-body-xs govuk-!-margin-top-0">
        {isLinked && (
          <>
            <Link href={`/workflows/${workflow.workflowId}`}>
              <a className="lbh-link lbh-link--no-visited-state">
                See {isReassessment ? "previous assessment" : "linked workflow"}
              </a>
            </Link>{" "}
            ·{" "}
          </>
        )}

        {process.env.NEXT_PUBLIC_ENVIRONMENT !== "PROD" && (
          <button
            className="lbh-link lbh-link--no-visited-state"
            onClick={() => setOpen(true)}
          >
            {isLinked ? "Change" : "Link to something"}
          </button>
        )}
      </p>

      <Dialog
        isOpen={open}
        onDismiss={() => setOpen(false)}
        title="Change or add workflow link"
      >
        <p>
          Related workflows of different types can be joined together like links
          in a chain.
        </p>
        <Formik
          initialValues={{ workflowId: workflow.workflowId || "" }}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, touched, errors }) => (
            <Form>
              <SelectField
                name="workflowId"
                label="Workflow to link to"
                hint="This doesn't include reassessments"
                touched={touched}
                errors={errors}
                choices={workflowChoices}
              />
              <button
                className="govuk-button lbh-button"
                disabled={isSubmitting}
              >
                Save changes
              </button>
            </Form>
          )}
        </Formik>
      </Dialog>
    </>
  )
}

export default EpisodeDialog
