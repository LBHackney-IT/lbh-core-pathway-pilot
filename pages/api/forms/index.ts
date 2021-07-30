import { NextApiRequest, NextApiResponse } from "next"
import { apiHandler } from "../../../lib/apiHelpers"
import forms from "../../../config/forms"

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  res.json(forms)
}

export default apiHandler(handler)
