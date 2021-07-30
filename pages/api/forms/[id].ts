import { NextApiRequest, NextApiResponse } from "next"
import { apiHandler } from "../../../lib/apiHelpers"
import forms from "../../../config/forms"

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query
  const form = forms.find(form => id === form.id)
  res.json(form)
}

export default apiHandler(handler)
