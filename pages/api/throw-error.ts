import {apiHandler} from "../../lib/apiHelpers";
import {NextApiRequest, NextApiResponse} from "next";
import {middleware as csrfMiddleware} from "../../lib/csrfToken";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  throw Error("ErrorThrowingPage api error")
};

export default apiHandler(csrfMiddleware(handler))
