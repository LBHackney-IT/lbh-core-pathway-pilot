import {GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult} from "next";
import {unprotectedPages} from "../config";
import {getSession} from "next-auth/client";
import {setUser} from "@sentry/nextjs";

export const protectRoute =
  (getServerSideProps: GetServerSideProps) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<{ [key:string]: any }>> => {
      const {resolvedUrl, req} = context;
      const session = await getSession({ req });

      if (
        !session &&
        !unprotectedPages.includes(resolvedUrl?.split('?')[0])
      ) return {
        props: {},
        redirect: {
          statusCode: 307,
          destination: `/sign-in${resolvedUrl ? '?page=' + encodeURI(resolvedUrl) : ''}`,
        },
      };

      if (session) setUser({email: session.user.email});

      return getServerSideProps(context);
    };
