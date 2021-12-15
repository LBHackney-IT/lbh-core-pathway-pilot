import {GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult} from "next";
import {getLoginUrl, UserNotLoggedIn, UserNotInGroup} from "./auth/session";
import {gate} from "./auth/route";

export const protectRoute =
  (getServerSideProps: GetServerSideProps, requiredGroups: Array<string> = []) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<{ [key: string]: any }>> => {
      const {resolvedUrl, req} = context;

      try {
        await gate(req, requiredGroups, []);

      } catch (e) {
        switch (e.constructor) {
          case UserNotInGroup:
            return {
              props: {},
              redirect: {
                statusCode: 307,
                destination: req?.headers?.referer || '/',
              },
            };
          case UserNotLoggedIn:
            return {
              props: {},
              redirect: {
                statusCode: 307,
                destination: getLoginUrl(resolvedUrl),
              },
            };
          default:
            throw e;
        }
      }

      return getServerSideProps(context);
    };
