import {GetServerSideProps} from "next"
import Layout from "../../components/_Layout"
import {protectRoute} from "../../lib/protectRoute";

const SignInPage = (): React.ReactElement => {
  return (
    <Layout announcementArea={(
      <section className="lbh-announcement lbh-announcement--site">
        <div className="lbh-container">
          <h3 className="lbh-announcement__title">You can close this window</h3>
          <div className="lbh-announcement__content">
            <p>
              You were signed out, but we have signed you in again.
            </p>
            <p>
              You may now close this window or tab to return to your work.
            </p>
          </div>
        </div>
      </section>
    )}>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps =
  protectRoute(async () => ({props: {}}));

export default SignInPage;
