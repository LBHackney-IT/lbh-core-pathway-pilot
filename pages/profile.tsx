import { Form, Formik } from "formik"
import { useSession } from "next-auth/client"
import React from "react"
import FormStatusMessage from "../components/FormStatusMessage"
import Layout from "../components/_Layout"
import shortcutOptions from "../config/shortcuts"

const ProfilePage = (): React.ReactElement => {
  const [session] = useSession()

  const handleSubmit = (values, { setStatus }) => {
    // TODO: update logged in user
  }

  return (
    <Layout
      title="Preferences"
      breadcrumbs={[
        {
          href: process.env.NEXT_PUBLIC_SOCIAL_CARE_APP_URL,
          text: "My workspace",
        },
        { href: "/", text: "Workflows" },
        { text: "Preferences", current: true },
      ]}
    >
      <h1 className="govuk-!-margin-bottom-8">Preferences</h1>

      <Formik
        initialValues={{
          shortcuts: session?.user?.shortcuts,
        }}
        onSubmit={handleSubmit}
      >
        <Form>
          <FormStatusMessage />
          {/* fields go here */}

          {shortcutOptions.map(shortcutOption => (
            <input
              key={shortcutOption.id}
              type="checkbox"
              name={`shortcuts.${shortcutOption.id}`}
            />
          ))}

          <button type="submit" className="govuk-button lbh-button">
            Submit
          </button>
        </Form>
      </Formik>
    </Layout>
  )
}

export default ProfilePage
