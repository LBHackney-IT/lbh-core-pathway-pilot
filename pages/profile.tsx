import { useSession } from "next-auth/client"
import React from "react"
import Layout from "../components/_Layout"

const ProfilePage = (): React.ReactElement => {
  const [session] = useSession()

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
    </Layout>
  )
}

export default ProfilePage
