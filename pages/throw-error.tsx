import Layout from "../components/_Layout"
import { GetServerSideProps } from "next"
import {protectRoute} from "../lib/protectRoute";
import {csrfFetch} from "../lib/csrfToken";

interface Props {
  header: string;
}

const ErrorThrowingPage = ({ header }: Props): React.ReactElement => {
  return (
    <Layout title="Error!">
      <h1>{header}</h1>

      <button onClick={() => {throw new Error('ErrorThrowingPage component error')}}>
        throw frontend error
      </button>

      <a href="/throw-error?server=true">
        throw server error
      </a>

      <button onClick={() => {csrfFetch('/api/throw-error', {}).catch(e => {console.log(e)})}}>
        throw api error
      </button>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = protectRoute(async ({ query }) => {
  if (query.server) {
    throw new Error('ErrorThrowingPage getServerSideProps error');
  }

  return {
    props: {
      header: 'This page throws errors for testing purposes.'
    }
  };
});

export default ErrorThrowingPage
