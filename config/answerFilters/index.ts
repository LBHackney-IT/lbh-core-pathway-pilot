import { mockAnswerFilter } from "../../fixtures/answerFilter"
import { AnswerFilter } from "../../types"
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { Readable } from "stream"
import answerFilters from "./answerFilters.json"

export const answerFiltersForThisEnv = async (): Promise<AnswerFilter[]> => {
  if (process.env.NEXT_PUBLIC_ENV === "test" || process.env.NODE_ENV === "test")
    return mockAnswerFilter

  try {
    const client = new S3Client({ region: "eu-west-2" })
    const command = new GetObjectCommand({
      Bucket: process.env.CONTENT_BUCKET,
      Key: "answerFilters.json",
    })

    const answerFiltersFromS3 = await client.send(command)

    return await new Promise(resolve => {
      const chunks = []
      ;(answerFiltersFromS3.Body as Readable).on("data", chunk =>
        chunks.push(chunk)
      )
      ;(answerFiltersFromS3.Body as Readable).on("end", () =>
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")))
      )
    })
  } catch (e) {
    console.error(
      `[content][error] loading answer filters from local store: ${e}`
    )
    return answerFilters
  }
}

export default answerFiltersForThisEnv
