import { Form, Formik } from "formik"
import { useSession } from "next-auth/client"
import React from "react"
import FormStatusMessage from "../components/FormStatusMessage"
import CheckboxField from "../components/FlexibleForms/CheckboxField"
import Layout from "../components/_Layout"
import shortcutOptions from "../config/shortcuts"
import {
  AutosaveIndicator,
  AutosaveProvider,
  AutosaveTrigger,
} from "../contexts/autosaveContext"
import { csrfFetch } from "../lib/csrfToken"
import { profileSchema } from "../lib/validators"

const ProfilePage = (): React.ReactElement => {
  const [session] = useSession()

  const handleSubmit = async (values, { setStatus }) => {
    try {
      const res = await csrfFetch(`/api/profile`, {
        method: "PATCH",
        body: JSON.stringify({
          ...values,
        }),
      })
      if (!res.ok) throw res.status
    } catch (e) {
      setStatus(e.toString())
    }
  }

  return (
    <AutosaveProvider>
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

        <AutosaveIndicator />

        <Formik
          initialValues={{
            shortcuts: session?.user?.shortcuts,
          }}
          validationSchema={profileSchema}
          onSubmit={handleSubmit}
        >
          {({ touched, errors }) => (
            <Form>
              <AutosaveTrigger />

              <FormStatusMessage />

              <CheckboxField
                touched={touched}
                errors={errors}
                name={`shortcuts`}
                label="Which shortcuts do you want to use?"
                hint="Shortcuts appear at the top of your dashboard"
                choices={shortcutOptions.map(shortcutOption => ({
                  label: shortcutOption.title,
                  hint: shortcutOption.description,
                  value: shortcutOption.id,
                }))}
              />
            </Form>
          )}
        </Formik>
      </Layout>
    </AutosaveProvider>
  )
}

export default ProfilePage
