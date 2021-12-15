import {NextApiRequest, NextApiResponse} from "next"
import {apiHandler} from "../../../lib/apiHelpers"
import {middleware as csrfMiddleware} from "../../../lib/csrfToken"

export const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  if (req.method !== 'GET') {
    res.status(405).json({error: `${req.method} not supported on this endpoint`});
    return;
  }

  if (!req['user']) {
    res.status(401).json({error: "User not logged in"});
    return;
  }

  res.status(200).json({
    session: req['user'],
  });
}

export default apiHandler(csrfMiddleware(handler))
