import { GetServerSideProps } from "next"
import Head from "next/head"
import { Form } from "../../../types"
import { useEffect } from "react"
import PrintableWorkflow from "../../../components/PrintableWorkflow"
import prisma from "../../../lib/prisma"
import forms from "../../../config/forms"
import { Workflow } from "@prisma/client"

interface Props extends Workflow {
  form?: Form
}

const PrintableFormPage = (workflow: Props): React.ReactElement => {
  useEffect(() => {
    window.print()
  }, [])

  return (
    <>
      <Head>
        <title>{workflow?.form?.name || "Unknown form"}</title>
      </Head>
      <PrintableWorkflow workflow={workflow} />
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
