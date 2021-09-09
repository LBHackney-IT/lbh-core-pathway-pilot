import Layout from "../components/_Layout"

const NotFound = (): React.ReactElement => (
  <Layout title="There is a problem with the service">
    <h1>Sorry, there is a problem with the service</h1>

    <p>Refresh the page, or try again later.</p>
    <p>If you continue to see this page, <a href="https://forms.gle/pVuBfxcm2kqxT8D68">let us know</a>.</p>
  </Layout>
)

export default NotFound
