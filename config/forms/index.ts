import forms from "./forms.json"
import {Form, Step} from "../../types"
import {mockForm} from "../../fixtures/form"
import {GetObjectCommand, S3Client} from "@aws-sdk/client-s3";

const flattenSteps = element =>
  element.themes.reduce((acc, theme) => acc.concat(theme.steps), [])

/** if this is cypress, return a static mock form instead */
export const formsForThisEnv = (): Form[] => {
  if (process.env.NEXT_PUBLIC_ENV === "test" || process.env.NODE_ENV === "test")
    return [mockForm];

    return forms;
}

export const asyncFormsForThisEnv = async (): Promise<Form[]> => {
  if (process.env.NEXT_PUBLIC_ENV === "test" || process.env.NODE_ENV === "test")
    return [mockForm];

  try {
    const client = new S3Client({ region: "eu-west-2" });
    const command = new GetObjectCommand({
      Bucket: process.env.CONTENT_BUCKET,
      Key: "forms.json",
    });

    const formFromS3 = await client.send(command);

    return await new Promise(resolve => {
      const chunks = [];
      formFromS3.Body.on('data', chunk => chunks.push(chunk));
      formFromS3.Body.on('end', () => resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))));
    });
  } catch (e) {
    return forms;
  }
}

/** flat array of all the steps, across all elements and themes  */
export const allSteps: Step[] = formsForThisEnv().reduce(
  (acc, element) => acc.concat(flattenSteps(element)),
  []
)

export default formsForThisEnv()
