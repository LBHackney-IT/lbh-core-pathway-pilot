import { NextApiResponse } from "next"
import { apiHandler, ApiRequestWithSession } from "../../lib/apiHelpers"
import fetch from "node-fetch"
import { getResidentById } from "../../lib/residents"

export const handler = async (
  req: ApiRequestWithSession,
  res: NextApiResponse
): Promise<void> => {
  switch (req.method) {
    case "POST": {
      if (req.headers["x-api-key"] !== process.env.GMAIL_INBOUND_TOKEN)
        throw "Not authorised"

      const {
        thread,
        message,
        social_care_id,
        //   type,
        summary,
        worker,
      } = JSON.parse(req.body)

      const resident = await getResidentById(social_care_id)

      if (!resident) throw "Person couldn't be found"

      const res2 = await fetch(
        `${process.env.SOCIAL_CARE_API_ENDPOINT}/cases`,
        {
          headers: {
            "x-api-key": process.env.SOCIAL_CARE_API_KEY,
            "Content-Type": "application/json",
          },
          method: "POST",

          body: JSON.stringify({
            formName: "Example submission",
            formNameOverall: "ASC_case_note",
            firstName: "Spicy",
            lastName: "Dev",
            workerEmail: worker,
            dateOfBirth: resident.dateOfBirth,
            personId: Number(resident.mosaicId),
            contextFlag: "A",
            caseFormData: JSON.stringify({
              case_note_title: summary,
              case_note_description: JSON.stringify(thread || message),
            }),
          }),
        }
      )

      if (res2.status !== 200)
        throw (
          (await res2.text()) ||
          "Couldn't save record. Please try again later or report the problem if it continues."
        )

      const data2 = await res2.json()

      res.json({ message: data2 })

      break
    }

    default: {
      res.status(405).json({ error: "Method not supported on this endpoint" })
    }
  }
}

export default apiHandler(handler)
