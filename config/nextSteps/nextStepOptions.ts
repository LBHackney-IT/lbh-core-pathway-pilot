import { NextStepOption } from "../../types"
import nextStepOptions from "./nextStepOptions.json"
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { mockNextStepOptions } from "../../fixtures/nextStepOptions"
import { Readable } from "stream"

export const nextStepOptionsForThisEnv = async (): Promise<
  NextStepOption[]
> => {
  if (process.env.NEXT_PUBLIC_ENV === "test" || process.env.NODE_ENV === "test")
    return mockNextStepOptions

  try {
    const client = new S3Client({ region: "eu-west-2" })
    const command = new GetObjectCommand({
      Bucket: process.env.CONTENT_BUCKET,
      Key: "nextStepOptions.json",
    })

    const nextStepOptionsFromS3 = await client.send(command)

    return await new Promise(resolve => {
      const chunks = []
      ;(nextStepOptionsFromS3.Body as Readable).on("data", chunk =>
        chunks.push(chunk)
      )
      ;(nextStepOptionsFromS3.Body as Readable).on("end", () =>
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")))
      )
    })
  } catch (e) {
    console.error(
      `[content][error] loading next step options from local store: ${e}`
    )
    return nextStepOptions
  }
}

export default nextStepOptionsForThisEnv
