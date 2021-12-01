import { NextApiResponse } from "next"
import { ApiRequestWithSession } from "../../lib/apiHelpers"
import fetch from "node-fetch"
import { getResidentById } from "../../lib/residents"
import { gmailAddOnSchema } from "../../lib/validators"
import { prettyGmailMessage } from "../../lib/formatters"

/** the custom format we have the add-on provide to us */
export interface GmailMessage {
  to: string
  from: string
  subject: string
  date: string
  body: string
}

interface GmailInboundBody {
  thread?: GmailMessage[]
  message?: GmailMessage
  social_care_id: string
  summary: string
  worker_email: string
}

export const handler = async (
  req: ApiRequestWithSession,
  res: NextApiResponse
): Promise<void> => {
  try {
    switch (req.method) {
      case "POST": {
        // 1. is the user authenticated?
        const token = req.headers["x-api-key"]
        if (!token || token !== process.env.GMAIL_INBOUND_TOKEN)
          throw "Not authorised: token missing or incorrect"

        // 2. is all the information provided?
        await gmailAddOnSchema.validate(req.body)

        const { thread, message, social_care_id, summary, worker_email } =
          req.body as GmailInboundBody

        // 3. get resident metadata
        const resident = await getResidentById(social_care_id)

        if (!resident) throw "Person couldn't be found"

        // 4. add record
        const res2 = await fetch(
          `${process.env.SOCIAL_CARE_API_ENDPOINT}/cases`,
          {
            headers: {
              "x-api-key": process.env.SOCIAL_CARE_API_KEY,
              "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({
              formName: thread ? "Email thread" : "Email message",
              formNameOverall: "ASC_case_note", // needed to make things display in the right way on the timeline
              firstName: resident.firstName,
              lastName: resident.lastName,
              workerEmail: worker_email,
              dateOfBirth: resident.dateOfBirth,
              personId: Number(resident.mosaicId),
              contextFlag: "A", // only adult social care is supported right now
              caseFormData: JSON.stringify({
                case_note_title: summary,
                // format messages to display well as plain text
                case_note_description: thread
                  ? thread
                      .map(message => prettyGmailMessage(message))
                      .join("\n\n")
                  : prettyGmailMessage(message),
              }),
            }),
          }
        )

        // 5. if adding the record failed, return a useful message
        if (res2.status !== 201)
          throw (
            (await res2.text()) ||
            "Couldn't save record. Please try again later or report the problem if it continues."
          )

        const data2 = await res2.json()

        res.status(201).json({ message: data2 })

        break
      }

      default: {
        res.status(405).json({ error: "Method not supported on this endpoint" })
      }
    }
  } catch (e) {
    console.error(e)
    res.status(400).json({ error: e.toString() })
  }
}

export default handler
