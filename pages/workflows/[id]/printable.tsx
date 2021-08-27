import { GetServerSideProps } from "next"
import Head from "next/head"
import { Form, FlexibleAnswers as FlexibleAnswersT } from "../../../types"
import { useEffect } from "react"
import prisma from "../../../lib/prisma"
import forms from "../../../config/forms"
import { Workflow } from "@prisma/client"
import FlexibleAnswers from "../../../components/FlexibleAnswers/FlexibleAnswers"
import { prettyResidentName } from "../../../lib/formatters"
import useResident from "../../../hooks/useResident"

interface Props extends Workflow {
  form?: Form
}

const PrintableFormPage = (workflow: Props): React.ReactElement => {
  const { data: resident } = useResident(workflow.socialCareId)

  useEffect(() => {
    if (resident) window.print()
  }, [resident])

  return (
    <>
      <Head>
        <title>{workflow?.form?.name || "Unknown form"}</title>
      </Head>
      <h1>
        {workflow?.form?.name || "Workflow"} for {prettyResidentName(resident)}
      </h1>
      <FlexibleAnswers
        answers={workflow.answers as FlexibleAnswersT}
        form={workflow.form}
        forceOpen
      />
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const { id } = query

  const workflow = await prisma.workflow.findUnique({
    where: {
      id: id as string,
    },
  })

  // redirect if workflow doesn't exist
  if (!workflow)
    return {
      props: {},
      redirect: {
        destination: "/404",
      },
    }

  return {
    props: {
      ...JSON.parse(
        JSON.stringify({
          ...workflow,
          form: forms.find(form => form.id === workflow.formId),
        })
      ),
    },
  }
}

PrintableFormPage.noLayout = true

export default PrintableFormPage
