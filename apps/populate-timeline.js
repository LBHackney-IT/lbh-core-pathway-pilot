const fetch = require("node-fetch")
const formList = require("../config/forms/forms.json")
const { PrismaClient } = require("@prisma/client")

require("dotenv").config()

const dayWeLaunchedTimelineIntegration = new Date(2021, 10, 17, 14, 0, 0, 0)

// Get core data about a person by their social care ID
const getResidentById = async id => {
  try {
    const res = await fetch(
      `${process.env.SOCIAL_CARE_API_ENDPOINT}/residents/${id}`,
      {
        headers: {
          "x-api-key": process.env.SOCIAL_CARE_API_KEY,
        },
      }
    )

    if (res.status === 404) {
      return null
    } else {
      const residentFromSCCV = await res.json()

      return {
        mosaicId: String(residentFromSCCV.id),
        firstName: residentFromSCCV.firstName,
        lastName: residentFromSCCV.lastName,
        gender: residentFromSCCV.gender,
        dateOfBirth: residentFromSCCV.dateOfBirth || null,
        nhsNumber: residentFromSCCV.nhsNumber
          ? String(residentFromSCCV.nhsNumber)
          : null,
        ageContext: residentFromSCCV.contextFlag,
        restricted: residentFromSCCV.restricted,
        addressList: residentFromSCCV.address
          ? [
              {
                addressLine1: residentFromSCCV.address?.address,
                postCode: residentFromSCCV.address?.postcode,
              },
            ]
          : [],
        phoneNumber: residentFromSCCV.phoneNumbers.map(phoneNumber => ({
          phoneNumber: phoneNumber.number,
          phoneType: phoneNumber.type,
        })),
        ethnicity: residentFromSCCV.ethnicity || null,
        firstLanguage: residentFromSCCV.firstLanguage || null,
        religion: residentFromSCCV.religion || null,
        sexualOrientation: residentFromSCCV.sexualOrientation || null,
        emailAddress: residentFromSCCV.emailAddress || null,
        preferredMethodOfContact:
          residentFromSCCV.preferredMethodOfContact || null,
        otherNames: residentFromSCCV.otherNames.map(otherName => ({
          firstName: otherName.firstName,
          lastName: otherName.lastName,
        })),
      }
    }
  } catch (e) {
    return null
  }
}

const addRecordToCase = async workflow => {
  // 1. grab resident data
  const resident = await getResidentById(workflow.socialCareId)

  // 2. grab form
  const form = formList.find(form => form.id === workflow.formId)

  // 3. add record
  const res = await fetch(`${process.env.SOCIAL_CARE_API_ENDPOINT}/cases`, {
    headers: {
      "x-api-key": process.env.SOCIAL_CARE_API_KEY,
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      formName: form.name,
      formNameOverall: "ASC_case_note",
      firstName: resident.firstName,
      lastName: resident.lastName,
      workerEmail: workflow.submittedBy,
      dateOfBirth: resident.dateOfBirth,
      personId: Number(resident.mosaicId),
      contextFlag: resident.ageContext,
      caseFormData: JSON.stringify({
        workflowId: workflow.id,
      }),
    }),
  })
  if (res.status !== 201) throw await res.text()
}

// look for records submitted by this user and for the same social care id
const getCasesByWorkerAndId = async (worker_email, mosaic_id, cursor) => {
  const res = await fetch(
    `${process.env.SOCIAL_CARE_API_ENDPOINT}/cases?worker_email=${worker_email}&mosaic_id=${mosaic_id}&cursor=${cursor}`,
    {
      headers: {
        "x-api-key": process.env.SOCIAL_CARE_API_KEY,
        "Content-Type": "application/json",
      },
    }
  )
  return await res.json()
}

const run = async () => {
  try {
    console.log("Connecting to DB...")
    const db = new PrismaClient()

    const workflows = await db.workflow.findMany({
      where: {
        type: { not: "Historic" },
        OR: [
          {
            panelApprovedAt: {
              not: null,
              lt: dayWeLaunchedTimelineIntegration,
            },
          },
          {
            managerApprovedAt: {
              not: null,
              lt: dayWeLaunchedTimelineIntegration,
            },
            needsPanelApproval: false,
          },
        ],
      },
    })

    await Promise.all(
      workflows.map(async workflow => {
        let cursor = "0"
        let cases = []

        while (cursor !== null) {
          const pageOfCases = await getCasesByWorkerAndId(
            workflow.submittedBy,
            workflow.socialCareId,
            cursor
          )
          cursor = pageOfCases.nextCursor
          cases = cases.concat(pageOfCases.cases)
        }

        const existingRecord =
          cases?.length > 0 &&
          cases.find(c => c.caseFormData.workflowId === workflow.id)

        if (existingRecord)
          return console.log(
            `Case already exists for workflow ${workflow.id}. Skipping...`
          )

        await addRecordToCase(workflow)
        console.log(`Added case for workflow ${workflow.id}`)
      })
    )

    console.log(`Done: ${workflows.length} processed`)
  } catch (e) {
    console.log(e)
  }
}

export const handler = run
