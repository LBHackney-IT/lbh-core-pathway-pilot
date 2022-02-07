import Dialog from "./Dialog"
import s from "./EpisodeDialog.module.scss"
import { useState } from "react"
import { Workflow } from "@prisma/client"
import { Form, Formik } from "formik"
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

  const workflowChoices = [
    {
      value: "",
      label: "None",
    },
  ].concat(
    linkableWorkflows?.workflows?.map(linkableWorkflow => ({
      label: `${
        forms?.find(form => form.id === linkableWorkflow.formId)?.name ||
        linkableWorkflow.formId
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
      {process.env.NEXT_PUBLIC_ENVIRONMENT !== "PROD" && (
        <button className={s.button} onClick={() => setOpen(true)}>
          {isLinked ? "Change" : "Link to something"}
        </button>
      )}

      <Dialog
        isOpen={open}
        onDismiss={() => setOpen(false)}
        title="Change or add a linked workflow"
      >
        <p>
          Workflows of different types can be joined together to show that they&apos;re related.
        </p>
        <Formik
          initialValues={{ workflowId: workflow.workflowId || "" }}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, touched, errors }) => (
            <Form>
              <SelectField
                name="workflowId"
                label="Link this workflow to:"
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
