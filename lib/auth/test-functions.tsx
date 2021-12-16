import {ReactElement} from "react";
import {sign} from "jsonwebtoken";
import {getLoginUrl, getSession, UserNotLoggedIn} from "./session";
import {render} from "@testing-library/react";
import {SessionContext} from "./SessionContext";
import {GetServerSideProps, GetServerSidePropsContext, NextApiRequest, NextApiResponse} from "next";
import {
  mockSession,
  mockSessionApprover,
  mockSessionNotInPilot,
  mockSessionPanelApprover
} from "../../fixtures/session";
import {ParsedUrlQuery} from "querystring";
import {Array} from "io-ts";
import {UserSession} from "./types";

export const dateToUnix = (date: Date): number => Math.floor(date.getTime() / 1000);

interface MakeTokenInput {
  sub?: string;
  email?: string
  iss?: string;
  name?: string;
  groups?: Array<string>;
  iat?: Date,
}

export const makeToken = (
  {
    sub = '49516349857314',
    email = 'test@example.com',
    iss = 'Hackney',
    name = 'example user',
    groups = ['test-group'],
    iat = new Date(),
  }: MakeTokenInput
): string => sign(
  {sub, email, iss, name, groups, iat: dateToUnix(iat)},
  process.env.HACKNEY_AUTH_TOKEN_SECRET,
);

export interface MakeNextApiRequestInput {
  method?: 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'CONNECT' | 'OPTIONS' | 'TRACE' | 'PATCH';
  query?: ParsedUrlQuery;
  url?: string;
  session?: UserSession;
  body?: unknown;
  headers?: {
    [key: string]: string;
  };
}

export const makeNextApiRequest =
  ({
     method = 'GET',
     query = {},
     url = '/',
     session = null,
     body = null,
     headers = {},
   }: MakeNextApiRequestInput): NextApiRequest => {
    const request = {
      method,
      url,
      query,
      headers,
    } as unknown as NextApiRequest;

    if (session) request['user'] = session;
    if (body) request['body'] = JSON.stringify(body);

    return request;
  };

export interface MakeGetServerSidePropsContextInput {
  resolvedUrl?: string;
  method?: string;
  token?: string;
  query?: ParsedUrlQuery;
  referer?: string;
}

export const makeGetServerSidePropsContext =
  ({
     resolvedUrl = '/url',
     method = 'GET',
     token = makeToken({}),
     query = {},
     referer = null,
   }: MakeGetServerSidePropsContextInput): GetServerSidePropsContext => {
    const context = {
      params: {},
      query,
      req: {
        method,
        headers: {},
        cookies: {},
      },
      res: {},
      resolvedUrl,
    };

    if (token) context.req.cookies[process.env.HACKNEY_AUTH_COOKIE_NAME] = token;
    if (referer) context.req.headers["referer"] = referer;

    return context as unknown as GetServerSidePropsContext;
  };

export const renderWithSession = (components: ReactElement, session: UserSession = mockSession): void => {
  render(
    <SessionContext.Provider value={session}>
      {components}
    </SessionContext.Provider>
  )
};

export type HttpMethod =
  'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'CONNECT' | 'OPTIONS' | 'TRACE' | 'PATCH';

export const testApiHandlerUnsupportedMethods = (
  apiHandler: (
    req: NextApiRequest,
    res: NextApiResponse
  ) => Promise<void>,
  allowedMethods: Array<HttpMethod>,
): void => {
  const allMethods: Array<HttpMethod> = ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'CONNECT', 'OPTIONS', 'TRACE', 'PATCH'];
  const methods: Array<HttpMethod> = allMethods
    .filter((method: HttpMethod) => !allowedMethods.includes(method));

  describe('when called with unsupported http method', () => {
    methods.forEach(method => {
      const mockJson = jest.fn();

      const response = {
        status: jest.fn().mockReturnValue({json: mockJson}),
        json: mockJson,
      } as unknown as NextApiResponse

      describe(`when called with a ${method} request`, () => {
        beforeAll(async () =>
          await apiHandler(makeNextApiRequest({
            method,
          }), response));

        test('a 405 http status code is returned', () => {
          expect(response.status).toHaveBeenCalledWith(405)
        });
        test('an error message is provided', () => {
          expect(response.json).toHaveBeenCalledWith({
            error: `${method} not supported on this endpoint`,
          })
        });
      });
    })
  });
};

export const testGetServerSidePropsAuthRedirect = (
  getServerSideProps: GetServerSideProps,
  redirectWhenNotInPilotGroup: boolean | string = true,
  redirectWhenOnlyApprover: boolean | string = true,
  redirectWhenOnlyPanelApprover: boolean | string = true,
): void => {
  describe('authentication redirects', function () {
    describe("when user not in the pilot group", () => {
      if (redirectWhenNotInPilotGroup) {
        it("returns a redirect to the root page", async () => {
          ;(getSession as jest.Mock).mockResolvedValueOnce(mockSessionNotInPilot);
          const response = await getServerSideProps(makeGetServerSidePropsContext({}))

          expect(response).toHaveProperty(
            "redirect",
            {
              destination: (typeof redirectWhenNotInPilotGroup === 'string') ?
                redirectWhenNotInPilotGroup : '/',
              statusCode: 307,
            },
          );
        })

        it("returns a redirect to the referring page", async () => {
          ;(getSession as jest.Mock).mockResolvedValueOnce(mockSessionNotInPilot);
          const response = await getServerSideProps(makeGetServerSidePropsContext({
            referer: 'test-referer',
          }));

          expect(response).toHaveProperty(
            "redirect",
            {
              destination: (typeof redirectWhenNotInPilotGroup === 'string') ?
                redirectWhenNotInPilotGroup : 'test-referer',
              statusCode: 307,
            }
          )
        })
      } else {
        it("does not redirect the user away", async () => {
          ;(getSession as jest.Mock).mockResolvedValueOnce(mockSessionNotInPilot);
          const response = await getServerSideProps(makeGetServerSidePropsContext({}))

          expect(response).not.toHaveProperty("redirect");
          expect(response).toHaveProperty("props");
        })
      }
    });

    describe('when user is only an approver', () => {
      if (redirectWhenOnlyApprover) {
        it("returns a redirect to the root page", async () => {
          ;(getSession as jest.Mock).mockResolvedValueOnce(mockSessionApprover);
          const response = await getServerSideProps(makeGetServerSidePropsContext({}))

          expect(response).toHaveProperty(
            "redirect",
            {
              destination: (typeof redirectWhenOnlyApprover === 'string') ?
                redirectWhenOnlyApprover : '/',
              statusCode: 307,
            }
          )
        })

        it("returns a redirect to the referring page", async () => {
          ;(getSession as jest.Mock).mockResolvedValueOnce(mockSessionApprover);
          const response = await getServerSideProps(makeGetServerSidePropsContext({
            referer: 'test-referer',
          }));

          expect(response).toHaveProperty(
            "redirect",
            {
              destination: (typeof redirectWhenOnlyApprover === 'string') ?
                redirectWhenOnlyApprover : 'test-referer',
              statusCode: 307,
            }
          )
        })
      } else {
        it("does not redirect the user away", async () => {
          ;(getSession as jest.Mock).mockResolvedValueOnce(mockSessionApprover);
          const response = await getServerSideProps(makeGetServerSidePropsContext({}))

          expect(response).not.toHaveProperty("redirect");
          expect(response).toHaveProperty("props");
        })
      }
    });

    describe('when user is only a panel approver', () => {
      if (redirectWhenOnlyPanelApprover) {
        it("returns a redirect to the root page", async () => {
          ;(getSession as jest.Mock).mockResolvedValueOnce(mockSessionPanelApprover);
          const response = await getServerSideProps(makeGetServerSidePropsContext({}))

          expect(response).toHaveProperty(
            "redirect",
            {
              destination: (typeof redirectWhenOnlyPanelApprover === 'string') ?
                redirectWhenOnlyPanelApprover : '/',
              statusCode: 307,
            }
          )
        })

        it("returns a redirect to the referring page", async () => {
          ;(getSession as jest.Mock).mockResolvedValueOnce(mockSessionPanelApprover);
          const response = await getServerSideProps(makeGetServerSidePropsContext({
            referer: 'test-referer',
          }));

          expect(response).toHaveProperty(
            "redirect",
            {
              destination: (typeof redirectWhenOnlyPanelApprover === 'string') ?
                redirectWhenOnlyPanelApprover : 'test-referer',
              statusCode: 307,
            }
          )
        })
      } else {
        it("does not redirect the user away", async () => {
          ;(getSession as jest.Mock).mockResolvedValueOnce(mockSessionPanelApprover);
          const response = await getServerSideProps(makeGetServerSidePropsContext({}))

          expect(response).not.toHaveProperty("redirect");
          expect(response).toHaveProperty("props");
        })
      }
    });

    describe("when user not authenticated", () => {
      it("returns a redirect to the sign-in page", async () => {
        ;(getSession as jest.Mock).mockRejectedValueOnce(new UserNotLoggedIn)
        ;(getLoginUrl as jest.Mock).mockReturnValueOnce('auth-server');
        const response = await getServerSideProps(makeGetServerSidePropsContext({}))

        expect(response).toHaveProperty(
          "redirect",
          expect.objectContaining({
            destination: expect.stringMatching('auth-server'),
          })
        )
      })
    });
  });
};
