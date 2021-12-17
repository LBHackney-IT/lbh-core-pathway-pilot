import Layout from "../components/_Layout"

const NotFound = (): React.ReactElement => (
  <Layout title="Page not found">
    <h1>Page not found</h1>

    <p>If you typed the web address, check it is correct.</p>
    <p>If you pasted the web address, check you copied the entire address.</p>
    <p>
      If the web address is correct or you selected a link or button, please
      report an issue.
    </p>
  </Layout>
)

export default NotFound
