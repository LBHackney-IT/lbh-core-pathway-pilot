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

interface Props {
  workflow: Workflow
  linkableWorkflows: Workflow[]
  forms: IForm[]
}

const EpisodeDialog = ({
  workflow,
  linkableWorkflows,
  forms,
}: Props): React.ReactElement => {
  const { push } = useRouter()
  const [open, setOpen] = useState<boolean>(false)

  const isLinked = workflow.workflowId
  const isReassessment = workflow.type === WorkflowType.Reassessment

  const workflowChoices = [
    {
      value: "",
      label: "None - start a new episode",
    },
  ].concat(
    linkableWorkflows.map(workflow => ({
      label: `${
        forms?.find(form => form.id === workflow.formId)?.name
      } (last edited ${prettyDate(String(workflow.createdAt))})`,
      value: workflow.id,
    })) || []
  )

  const handleSubmit = async (values, { setStatus }) => {
    try {
      const res = await csrfFetch(`/api/workflows/${workflow.id}/approval`, {
        method: "PUT",
        body: JSON.stringify(values),
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
        <button
          className="lbh-link lbh-link--no-visited-state"
          onClick={() => setOpen(true)}
        >
          {isLinked ? "Change" : "Link to something"}
        </button>
      </p>

      <Dialog
        isOpen={open}
        onDismiss={() => setOpen(false)}
        title="Change or add link"
      >
        <Formik
          initialValues={{ workflowId: workflow.workflowId || "" }}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, touched, errors }) => (
            <Form>
              <SelectField
                name="workflowId"
                label="Is this linked to any of this resident's earlier assessments?"
                hint="This doesn't include reassessments"
                touched={touched}
                errors={errors}
                choices={workflowChoices}
              />
              <button disabled={isSubmitting}>Save changes</button>
            </Form>
          )}
        </Formik>
        foo
      </Dialog>
    </>
  )
}

export default EpisodeDialog
