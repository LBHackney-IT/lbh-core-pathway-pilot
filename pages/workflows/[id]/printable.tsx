import { GetServerSideProps } from "next"
import Head from "next/head"
import { Form, FlexibleAnswers as FlexibleAnswersT } from "../../../types"
import prisma from "../../../lib/prisma"
import forms from "../../../config/forms"
import { Workflow } from "@prisma/client"
import FlexibleAnswers from "../../../components/FlexibleAnswers/FlexibleAnswers"
import useResident from "../../../hooks/useResident"
import s from "../../../styles/Printable.module.scss"
import ResidentDetailsList from "../../../components/ResidentDetailsList"
import { prettyResidentName } from "../../../lib/formatters"
import { protectRoute } from "../../../lib/protectRoute"

interface Props extends Workflow {
  form?: Form
}

const PrintableFormPage = (workflow: Props): React.ReactElement => {
  const { data: resident } = useResident(workflow.socialCareId)

  return (
    <div className={s.printable}>
      <Head>
        <title>
          {workflow?.form?.name || "Unknown form"} for{" "}
          {prettyResidentName(resident)} (#{resident?.mosaicId})
        </title>
      </Head>
      <h1>
        {workflow?.form?.name || "Workflow"} (
        {(workflow.type === "Reassessment" || workflow.type === "Review") &&
          "reassessment"}
        {workflow.type === "Historic" && "historic"})
      </h1>

      <button className={`lbh-link ${s.button}`} onClick={() => window.print()}>
        Print or save as PDF
      </button>

      <section className="lbh-collapsible">
        <div className="lbh-collapsible__button">
          <h2 className="lbh-collapsible__heading">Resident details</h2>
        </div>
        <div className="lbh-collapsible__content">
          {resident && <ResidentDetailsList resident={resident} />}
        </div>
      </section>

      <FlexibleAnswers
        answers={workflow.answers as FlexibleAnswersT}
        form={workflow.form}
        forceOpen
      />
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = protectRoute(
  async ({ query }) => {
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
            form: (await forms()).find(form => form.id === workflow.formId),
          })
        ),
      },
    }
  }
)

PrintableFormPage.noLayout = true

export default PrintableFormPage
