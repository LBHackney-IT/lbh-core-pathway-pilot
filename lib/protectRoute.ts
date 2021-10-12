import {GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult} from "next";
import {unprotectedPages} from "../config";
import {getSession} from "next-auth/client";

export const protectRoute =
  (getServerSideProps: GetServerSideProps) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<{ [key:string]: any }>> => {
      const {resolvedUrl} = context;

      if (
        !unprotectedPages.includes(resolvedUrl)
        && !await getSession()
      ) return {
        props: {},
        redirect: {
          statusCode: 307,
          destination: "/sign-in",
        },
      };


      return getServerSideProps(context);
    };
