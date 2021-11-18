import {apiHandler, ApiRequestWithSession} from "../../lib/apiHelpers";
import {NextApiResponse} from "next";
import {middleware as csrfMiddleware} from "../../lib/csrfToken";

const handler = async (req: ApiRequestWithSession, res: NextApiResponse) => {
  throw Error("ErrorThrowingPage api error")
};

export default apiHandler(csrfMiddleware(handler))
