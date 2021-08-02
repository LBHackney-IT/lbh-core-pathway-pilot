import { Theme } from "../../types"

const theme: Theme = {
  id: "first-theme",
  name: "First theme",
  steps: [
    {
      id: "first-step",
      name: "First step",
      fields: [
        {
          id: "start-date-of-conversation-3",
          question: "Start date of Conversation 3",
          hint: "",
          type: "date",
        },
        {
          id: "mosaic-id",
          question: "Mosaic ID",
          hint: "(if known)",
          type: "text",
        },
        {
          id: "emergency-id-asc",
          question: "Emergency ID (ASC)",
          hint: "(Find or create an emergency ID number for this person in the list of numbers provided to your team, and enter it here)",
          type: "text",
        },
        {
          id: "nhs-number",
          question: "NHS Number",
          hint: "(if known)",
          type: "text",
        },
        {
          id: "title",
          question: "Title",
          hint: "",
          type: "text",
        },
        {
          id: "first-name",
          question: "First name",
          hint: "",
          type: "text",
        },
        {
          id: "last-name",
          question: "Last name",
          hint: "",
          type: "text",
        },
        {
          id: "person-other-names-aliases",
          question: "Person Other Names (Aliases)",
          hint: "",
          type: "text",
        },
        {
          id: "gender",
          question: "Gender",
          hint: "",
          type: "radios",
          choices: [
            {
              value: "male",
              label: "Male",
            },
            {
              value: "female",
              label: "Female",
            },
            {
              value: "not-known",
              label: "Not Known",
            },
          ],
        },
        {
          id: "date-of-birth",
          question: "Date of birth",
          hint: "",
          type: "date",
        },
        {
          id: "address-line-1",
          question: "Address Line 1",
          hint: "(Primary Address)",
          type: "text",
        },
        {
          id: "address-line-2",
          question: "Address Line 2",
          hint: "(Primary Address)",
          type: "text",
        },
        {
          id: "address-line-3",
          question: "Address Line 3",
          hint: "(Primary Address)",
          type: "text",
        },
        {
          id: "postcode",
          question: "Postcode",
          hint: "(Primary Address)",
          type: "text",
        },
        {
          id: "contact-number",
          question: "Contact number",
          hint: "",
          type: "textarea",
        },
        {
          id: "person-email-address",
          question: "Person Email address",
          hint: "",
          type: "text",
        },
        {
          id: "primary-address-tenure-type",
          question: "Primary Address Tenure Type",
          hint: "",
          type: "select",
          choices: [
            {
              value: "owner-occupier-or-shared-ownership-scheme",
              label: "Owner occupier or shared ownership scheme",
            },
            {
              value:
                "tenant-including-local-authority-arms-length-management-organisations-registered-social-landlord-housing-association",
              label:
                "Tenant (including local authority, arms length management organisations, registered social landlord, housing association",
            },
            {
              value: "tenant--private-landlord",
              label: "Tenant - private landlord",
            },
            {
              value:
                "settled-mainstream-housing-with-familyfriends-including-flat-sharing",
              label:
                "Settled mainstream housing with family/friends (including flat sharing)",
            },
            {
              value:
                "supported-accommodation--supported-lodgings--supported-group-home-ie-accommodation-supported-by-staff-or-resident-care-taker",
              label:
                "Supported accommodation / supported lodgings / supported group home (i.e. accommodation supported by staff or resident care taker)",
            },
            {
              value: "shared-lives-scheme",
              label: "Shared lives scheme",
            },
            {
              value:
                "approved-premises-for-offenders-released-from-prison-or-under-probation-supervision-eg-probation-hostel",
              label:
                "Approved premises for offenders released from prison or under probation supervision (e.g. probation hostel)",
            },
            {
              value:
                "sheltered-housing--extra-care-housing--other-sheltered-housing",
              label:
                "Sheltered housing / extra care housing / other sheltered housing",
            },
            {
              value:
                "mobile-accommodation-for-gypsy--roma-and-traveller-communities",
              label:
                "Mobile accommodation for Gypsy / Roma and Traveller communities",
            },
            {
              value: "rough-sleeper--squatting",
              label: "Rough sleeper / squatting",
            },
            {
              value:
                "night-shelter--emergency-hostel--direct-access-hostel-temporary-accommodation-accepting-selfreferrals",
              label:
                "Night shelter / emergency hostel / direct access hostel (temporary accommodation accepting self-referrals)",
            },
            {
              value: "refuge",
              label: "Refuge",
            },
            {
              value:
                "placed-in-temporary-accommodation-by-the-council-including-homelessness-resettlement",
              label:
                "Placed in temporary accommodation by the council (including homelessness resettlement)",
            },
            {
              value: "staying-with-family--friends-as-a-shortterm-guest",
              label: "Staying with family / friends as a short-term guest",
            },
            {
              value:
                "acute--longterm-healthcare-residential-facility-or-hospital-eg-nhs-independent-general-hospital--clinic-longstay-hospital-specialist-rehabilitation--recovery-hospital",
              label:
                "Acute / long-term healthcare residential facility or hospital (e.g. NHS Independent general hospital / clinic, long-stay hospital, specialist rehabilitation / recovery hospital)",
            },
            {
              value: "registered-care-home",
              label: "Registered care home",
            },
            {
              value: "registered-nursing-home",
              label: "Registered nursing home",
            },
            {
              value: "prison--young-offenders-institution--detention-centre",
              label: "Prison / Young offenders institution / detention centre",
            },
            {
              value: "other-temporary-accomodation",
              label: "Other temporary accomodation",
            },
          ],
        },
        {
          id: "household-structure",
          question: "Household Structure",
          hint: "",
          type: "radios",
          choices: [
            {
              value: "lives-alone",
              label: "Lives alone",
            },
            {
              value: "lives-with-others",
              label: "Lives with Others",
            },
            {
              value: "unknown",
              label: "Unknown",
            },
          ],
        },
        {
          id: "list-your-key-contacts",
          question: "List your key contacts:",
          hint: "(Include 'Name', 'Relationship/Role', 'Address and Contact Details' for each individual that would appear in the Key Contacts table)",
          type: "textarea",
        },
        {
          id: "gp-name",
          question: "GP Name",
          hint: "",
          type: "text",
        },
        {
          id: "gp-practice",
          question: "GP Practice",
          hint: "",
          type: "textarea",
        },
        {
          id: "gp-address",
          question: "GP Address",
          hint: "",
          type: "textarea",
        },
        {
          id: "gp-telephone",
          question: "GP Telephone",
          hint: "",
          type: "text",
        },
        {
          id: "gp-email",
          question: "GP Email",
          hint: "",
          type: "text",
        },
        {
          id: "has-this-person-been-assessed-by-hackney-adult-social-care-before",
          question:
            "Has this person been assessed by Hackney adult social care before?",
          hint: "",
          type: "radios",
          choices: [
            {
              value: "yes",
              label: "Yes",
            },
            {
              value: "no",
              label: "No",
            },
            {
              value: "not-known",
              label: "Not known",
            },
          ],
        },
        {
          id: "primary-support-reason",
          question: "Primary Support Reason",
          hint: "",
          type: "select",
          choices: [
            {
              value: "physical-support--access--mobility-only",
              label: "Physical Support - Access & Mobility only",
            },
            {
              value: "physical-support--personal-care-support",
              label: "Physical Support - Personal care support",
            },
            {
              value: "sensory-support--support-for-visual-impairment",
              label: "Sensory Support - Support for visual impairment",
            },
            {
              value: "sensory-support--support-for-hearing-impairment",
              label: "Sensory Support - Support for hearing impairment",
            },
            {
              value: "sensory-support--support-for-dual-impairment",
              label: "Sensory Support - Support for dual impairment",
            },
            {
              value: "support-with-memory--cognition",
              label: "Support with Memory & Cognition",
            },
            {
              value: "learning-disability-support",
              label: "Learning Disability Support",
            },
            {
              value: "mental-health-support-asc",
              label: "Mental Health Support (ASC)",
            },
            {
              value: "mental-health-support-elft",
              label: "Mental Health Support (ELFT)",
            },
            {
              value: "social-support-substance-misuse-support",
              label: "Social Support: Substance misuse support",
            },
            {
              value: "social-support-asylum-seeker-support",
              label: "Social Support: Asylum seeker support",
            },
            {
              value: "social-support-support-for-social-isolationother",
              label: "Social Support: Support for Social Isolation/Other",
            },
          ],
        },
      ],
    },
    {
      id: "communication",
      name: "Communication",
      fields: [
        {
          id: "preferred-method-of-contact",
          question: "Preferred method of contact",
          hint: "(e.g. Telephone, Face to face or Video link)",
          type: "text",
        },
        {
          id: "fluency-in-english",
          question: "Fluency in English",
          hint: "",
          type: "text",
        },
        {
          id: "firstpreferred-language",
          question: "First/preferred language",
          hint: "",
          type: "text",
        },
        {
          id: "interpreter-required",
          question: "Interpreter required?",
          hint: "",
          type: "radios",
          choices: [
            {
              value: "yes",
              label: "Yes",
            },
            {
              value: "no",
              label: "No",
            },
          ],
        },
        {
          id: "do-you-have-communication-difficulties",
          question: "Do you have communication difficulties?",
          hint: "",
          type: "radios",
          choices: [
            {
              value: "yes",
              label: "Yes",
            },
            {
              value: "no",
              label: "No",
            },
          ],
        },
        {
          id: "do-you-have-any-difficulties-with-understanding-andor-retaining-information",
          question:
            "Do you have any difficulties with understanding and/or retaining information?",
          hint: "",
          type: "radios",
          choices: [
            {
              value: "yes",
              label: "Yes",
            },
            {
              value: "no",
              label: "No",
            },
          ],
        },
        {
          id: "do-you-have-any-difficulties-making-decisions-andor-understanding-their-impact",
          question:
            "Do you have any difficulties making decisions and/or understanding their impact?",
          hint: "",
          type: "radios",
          choices: [
            {
              value: "yes",
              label: "Yes",
            },
            {
              value: "no",
              label: "No",
            },
          ],
        },
        {
          id: "further-details-communication",
          question: "Further Details (Communication)",
          hint: "",
          type: "textarea",
        },
      ],
    },
    {
      id: "supporting-you-in-your-assessment",
      name: "Supporting you in your assessment",
      fields: [
        {
          id: "please-provide-details-of-difficulties-and-what-would-help-you-communicate-more-easily-during-your-assessment-eg-a-family-member-or-friend-present-an-independent-advocate-specialist-communication-support",
          question:
            "Please provide details of difficulties and what would help you communicate more easily during your assessment (e.g. a family member or friend present, an independent advocate, specialist communication support)",
          hint: "",
          type: "textarea",
        },
        {
          id: "please-list-other-people-involved-in-your-assessment-eg-advocate-carer-family-friend-other-professionals-provide-details-including-names-rolesrelationship-and-contact-details",
          question:
            "Please list other people involved in your assessment (e.g. advocate, carer, family, friend, other professionals) Provide details including names, roles/relationship and contact details.",
          hint: "",
          type: "textarea",
        },
      ],
    },
    {
      id: "about-you",
      name: "About You",
      fields: [
        {
          id: "did-the-client-choose-to-decline-any-further-social-services-support",
          question:
            "Did the client choose to decline any further Social Services support?",
          hint: "(Has the client stated that they do not wish further assessment or services from Hackney Adults Social Care at this point)",
          type: "radios",
          choices: [
            {
              value: "yes",
              label: "Yes",
            },
            {
              value: "no",
              label: "No",
            },
          ],
        },
        {
          id: "about-you",
          question: "About you",
          hint: "",
          type: "textarea",
        },
        {
          id: "are-you-able-to-access--use-the-internet",
          question: "Are you able to access / use the Internet?",
          hint: "",
          type: "text",
        },
        {
          id: "are-you-using-specialist-technology-to-help-you-manage-at-home-eg-telecare",
          question:
            "Are you using specialist technology to help you manage at home (e.g. telecare)",
          hint: "",
          type: "text",
        },
        {
          id: "what-resources-support-was-recommended-and-outcome",
          question: "What resources, support was recommended and outcome",
          hint: "",
          type: "textarea",
        },
        {
          id: "next-actions",
          question: "Next actions",
          hint: "",
          type: "textarea",
        },
        {
          id: "did-your-input-prevent-admission-to-hospital",
          question: "Did your input prevent admission to hospital",
          hint: "",
          type: "radios",
          choices: [
            {
              value: "yes",
              label: "Yes",
            },
            {
              value: "no",
              label: "No",
            },
          ],
        },
        {
          id: "number-of-visits",
          question: "Number of Visits",
          hint: "(including telephone calls to the person, etc)",
          type: "text",
        },
      ],
    },
    {
      id: "care-act-outcomes-and-eligibility",
      name: "Care Act Outcomes and Eligibility",
      fields: [
        {
          id: "1--do-you-have-a-condition-as-a-result-of-either-your-physical-mental-sensory-learning-or-cognitive-disabilities-or-illnesses-substance-misuse-or-brain-injury",
          question:
            "1.  Do you have a condition as a result of either your physical, mental, sensory, learning or cognitive disabilities or illnesses, substance misuse or brain injury?",
          hint: "",
          type: "radios",
          choices: [
            {
              value: "yes",
              label: "Yes",
            },
            {
              value: "no",
              label: "No",
            },
          ],
        },
        {
          id: "2--as-a-result-of-your-needs-are-you-unable-to-achieve-two-or-more-of-the-eligible-outcomes-below",
          question:
            "2.  As a result of your needs are you unable to achieve two or more of the eligible outcomes below",
          hint: "",
          type: "radios",
          choices: [
            {
              value: "yes",
              label: "Yes",
            },
            {
              value: "no",
              label: "No",
            },
          ],
        },
        {
          id: "can-you-maintain-a-habitable-home-environment-alone-within-a-reasonable-time-and-without-significant-pain-distress-anxiety-or-risk-to-yourself-or-others",
          question:
            'Can you "Maintain a habitable home environment" alone within a reasonable time and without significant pain, distress, anxiety, or risk to yourself or others?',
          hint: "",
          type: "radios",
          choices: [
            {
              value: "yes",
              label: "Yes",
            },
            {
              value: "no",
              label: "No",
            },
          ],
        },
        {
          id: "details-maintain-a-habitable-home-environment",
          question: "Details (Maintain a habitable home environment)",
          hint: "",
          type: "textarea",
        },
        {
          id: "can-you-manage-and-maintain-nutrition-alone-within-within-a-reasonable-time-and-without-significant-pain-distress-anxiety-or-risk-to-yourself-or-others",
          question:
            'Can you "Manage and maintain nutrition" alone within within a reasonable time and without significant pain, distress, anxiety or risk to yourself or others?',
          hint: "",
          type: "radios",
          choices: [
            {
              value: "yes",
              label: "Yes",
            },
            {
              value: "no",
              label: "No",
            },
          ],
        },
        {
          id: "details-manage-and-maintain-nutrition",
          question: "Details (Manage and maintain nutrition)",
          hint: "",
          type: "textarea",
        },
        {
          id: "can-you-manage-toilet-needs-alone-within-within-a-reasonable-time-and-without-significant-pain-distress-anxiety-or-risk-to-yourself-or-others",
          question:
            'Can you "Manage toilet needs" alone within within a reasonable time and without significant pain, distress, anxiety or risk to yourself or others?',
          hint: "",
          type: "radios",
          choices: [
            {
              value: "yes",
              label: "Yes",
            },
            {
              value: "no",
              label: "No",
            },
          ],
        },
        {
          id: "details-manage-toilet-needs",
          question: "Details (Manage toilet needs)",
          hint: "",
          type: "textarea",
        },
        {
          id: "can-you-maintain-personal-hygiene-alone-within-within-a-reasonable-time-and-without-significant-pain-distress-anxiety-or-risk-to-yourself-or-others",
          question:
            'Can you "Maintain personal hygiene" alone within within a reasonable time and without significant pain, distress, anxiety or risk to yourself or others?',
          hint: "",
          type: "radios",
          choices: [
            {
              value: "yes",
              label: "Yes",
            },
            {
              value: "no",
              label: "No",
            },
          ],
        },
        {
          id: "details-maintain-personal-hygiene",
          question: "Details (Maintain personal hygiene)",
          hint: "",
          type: "textarea",
        },
        {
          id: "can-you-be-appropriately-clothed-alone-within-within-a-reasonable-time-and-without-significant-pain-distress-anxiety-or-risk-to-yourself-or-others",
          question:
            'Can you "Be appropriately clothed" alone within within a reasonable time and without significant pain, distress, anxiety or risk to yourself or others?',
          hint: "",
          type: "radios",
          choices: [
            {
              value: "yes",
              label: "Yes",
            },
            {
              value: "no",
              label: "No",
            },
          ],
        },
        {
          id: "details-be-appropriately-clothed",
          question: "Details (Be appropriately clothed)",
          hint: "",
          type: "textarea",
        },
        {
          id: "can-you-develop-and-maintain-family-or-other-personal-relationships-alone-within-within-a-reasonable-time-and-without-significant-pain-distress-anxiety-or-risk-to-yourself-or-others",
          question:
            'Can you "Develop and maintain family or other personal relationships" alone within within a reasonable time and without significant pain, distress, anxiety or risk to yourself or others?',
          hint: "",
          type: "radios",
          choices: [
            {
              value: "yes",
              label: "Yes",
            },
            {
              value: "no",
              label: "No",
            },
          ],
        },
        {
          id: "details-develop-and-maintain-family-or-other-personal-relationships",
          question:
            "Details (Develop and maintain family or other personal relationships)",
          hint: "",
          type: "textarea",
        },
        {
          id: "can-you-make-use-of-necessary-facilities-or-services-in-the-local-community-including-public-transport-and-recreational-facilitiesservices-alone-within-within-a-reasonable-time-and-without-significant-pain-distress-anxiety-or-risk-to-yourself-or-others",
          question:
            'Can you "Make use of necessary facilities or services in the local community (including public transport and recreational facilities/services)" alone within within a reasonable time and without significant pain, distress, anxiety or risk to yourself or others?',
          hint: "",
          type: "radios",
          choices: [
            {
              value: "yes",
              label: "Yes",
            },
            {
              value: "no",
              label: "No",
            },
          ],
        },
        {
          id: "details-make-use-of-necessary-facilities-or-services-in-the-local-community",
          question:
            "Details (Make use of necessary facilities or services in the local community)",
          hint: "",
          type: "textarea",
        },
        {
          id: "can-you-access-and-engage-in-work-training-education-or-volunteering-alone-within-within-a-reasonable-time-and-without-significant-pain-distress-anxiety-or-risk-to-yourself-or-others",
          question:
            'Can you "Access and engage in work, training, education or volunteering" alone within within a reasonable time and without significant pain, distress, anxiety or risk to yourself or others?',
          hint: "",
          type: "radios",
          choices: [
            {
              value: "yes",
              label: "Yes",
            },
            {
              value: "no",
              label: "No",
            },
          ],
        },
        {
          id: "details-access-and-engage-in-work-training-education-or-volunteering",
          question:
            "Details (Access and engage in work, training, education or volunteering)",
          hint: "",
          type: "textarea",
        },
        {
          id: "can-you-carry-out-any-caring-responsibilities-for-a-child-alone-within-within-a-reasonable-time-and-without-significant-pain-distress-anxiety-or-risk-to-yourself-or-others",
          question:
            'Can you "Carry out any caring responsibilities for a child" alone within within a reasonable time and without significant pain, distress, anxiety or risk to yourself or others?',
          hint: "",
          type: "radios",
          choices: [
            {
              value: "yes",
              label: "Yes",
            },
            {
              value: "no",
              label: "No",
            },
          ],
        },
        {
          id: "details-carry-out-any-caring-responsibilities-for-a-child",
          question:
            "Details (Carry out any caring responsibilities for a child)",
          hint: "",
          type: "textarea",
        },
        {
          id: "can-you-be-able-to-make-use-of-your-home-safely-alone-within-within-a-reasonable-time-and-without-significant-pain-distress-anxiety-or-risk-to-yourself-or-others",
          question:
            'Can you "Be able to make use of your home safely" alone within within a reasonable time and without significant pain, distress, anxiety or risk to yourself or others?',
          hint: "",
          type: "radios",
          choices: [
            {
              value: "yes",
              label: "Yes",
            },
            {
              value: "no",
              label: "No",
            },
          ],
        },
        {
          id: "details-be-able-to-make-use-of-your-home-safely",
          question: "Details (Be able to make use of your home safely)",
          hint: "",
          type: "textarea",
        },
        {
          id: "3--as-a-result-of-being-unable-to-achieve-these-outcomes-is-there-or-is-there-likely-to-be-a-significant-impact-on-your-wellbeing",
          question:
            "3.  As a result of being unable to achieve these outcomes is there, or is there likely to be, a significant impact on your wellbeing?",
          hint: "",
          type: "radios",
          choices: [
            {
              value: "yes",
              label: "Yes",
            },
            {
              value: "no",
              label: "No",
            },
          ],
        },
      ],
    },
    {
      id: "impact-on-wellbeing",
      name: "Impact on wellbeing",
      fields: [
        {
          id: "details-of-the-impact-on-your-wellbeing-in-the-absence-of-any-support-you-may-already-have-in-place",
          question:
            "Details of the impact on your wellbeing (in the absence of any support you may already have in place)",
          hint: "",
          type: "textarea",
        },
      ],
    },
    {
      id: "informal-carer",
      name: "Informal Carer",
      fields: [
        {
          id: "do-you-receive-support-from-a-carer-informal--unpaid",
          question: "Do you receive support from a Carer (informal / unpaid)",
          hint: "",
          type: "radios",
          choices: [
            {
              value: "yes-carer",
              label: "Yes (Carer)",
            },
            {
              value: "no-carer",
              label: "No carer",
            },
          ],
        },
      ],
    },
    {
      id: "informal-carer-details",
      name: "Informal Carer Details",
      fields: [
        {
          id: "carer-mosaic-id",
          question: "Carer Mosaic ID",
          hint: "(if known)",
          type: "text",
        },
        {
          id: "carer-emergency-id-asc",
          question: "Carer Emergency ID (ASC)",
          hint: "(Find or create an emergency ID number for this person in the list of numbers provided to your team, and enter it here)",
          type: "text",
        },
        {
          id: "carer-nhs-number",
          question: "Carer NHS Number",
          hint: "(if known)",
          type: "text",
        },
        {
          id: "carer-first-name",
          question: "Carer First Name",
          hint: "",
          type: "text",
        },
        {
          id: "carer-last-name",
          question: "Carer Last Name",
          hint: "",
          type: "text",
        },
        {
          id: "relationship-to-main-subject-of-assessment",
          question: "Relationship to main subject of assessment",
          hint: "",
          type: "textarea",
        },
        {
          id: "is-this-the-main-carer-for-the-caredfor-person",
          question: "Is this the main carer for the cared-for person?",
          hint: "",
          type: "radios",
          choices: [
            {
              value: "yes",
              label: "Yes",
            },
            {
              value: "no",
              label: "No",
            },
          ],
        },
        {
          id: "if-conversation-is-completed-with-an-informal--unpaid-carer-present-would-the-carer-like-to-have-a-separate-conversation-",
          question:
            "If conversation is completed with an informal / unpaid Carer present, would the Carer like to have a separate conversation? ",
          hint: "",
          type: "radios",
          choices: [
            {
              value: "yes",
              label: "Yes",
            },
            {
              value: "no",
              label: "No",
            },
          ],
        },
        {
          id: "if-conversation-is-completed-with-the-carer-present-does-the-carer-agree-this-is-a-joint-conversation",
          question:
            "If conversation is completed with the Carer present, does the Carer agree this is a joint conversation?",
          hint: "",
          type: "radios",
          choices: [
            {
              value: "yes",
              label: "Yes",
            },
            {
              value: "no",
              label: "No",
            },
          ],
        },
      ],
    },
    {
      id: "joint-conversation-with-carer",
      name: "Joint Conversation with Carer",
      fields: [
        {
          id: "has-the-carer-been-assessed-as-having-one-or-more-eligible-need",
          question:
            "Has the carer been assessed as having one or more eligible need?",
          hint: "",
          type: "radios",
          choices: [
            {
              value: "yes",
              label: "Yes",
            },
            {
              value: "no",
              label: "No",
            },
          ],
        },
        {
          id: "impact-of-caring-on-your-own-carers-independence",
          question: "Impact of caring on your own Carer's independence",
          hint: "",
          type: "textarea",
        },
        {
          id: "what-are-your-informal-arrangements-when-you-are-unable-to-provide-care",
          question:
            "What are your informal arrangements when you are unable to provide care?",
          hint: "",
          type: "textarea",
        },
        {
          id: "does-the-person-that-you-care-for-have-any-special-requirements-that-we-should-know-about",
          question:
            "Does the person that you care for have any special requirements that we should know about?",
          hint: "",
          type: "textarea",
        },
        {
          id: "was-the-carer-provided-with-information-advice-and-other-universal-services--signposting",
          question:
            "Was the Carer provided with Information, Advice and Other Universal Services / Signposting?",
          hint: "",
          type: "radios",
          choices: [
            {
              value: "yes",
              label: "Yes",
            },
            {
              value: "no",
              label: "No",
            },
          ],
        },
        {
          id: "if-yes-was-the-carer-signposted-to-a-relevant-support-service-such-as-the-carers-centre-",
          question:
            "If yes, was the Carer signposted to a relevant support service such as the Carers Centre? ",
          hint: "",
          type: "radios",
          choices: [
            {
              value: "yes",
              label: "Yes",
            },
            {
              value: "no",
              label: "No",
            },
            {
              value: "not-applicable-not-signposted",
              label: "Not applicable (not signposted)",
            },
          ],
        },
        {
          id: "will-respite-or-other-forms-of-carer-support-be-delivered-to-the-caredfor-person-",
          question:
            "Will respite or other forms of carer support be delivered to the cared-for person? ",
          hint: "",
          type: "radios",
          choices: [
            {
              value: "yes",
              label: "Yes",
            },
            {
              value: "no",
              label: "No",
            },
          ],
        },
      ],
    },
    {
      id: "my-personal-budget",
      name: "My Personal Budget",
      fields: [
        {
          id: "my-total-weekly-hours-budget",
          question: "My total weekly hours (Budget)",
          hint: "(Use decimal notation for part-hours)",
          type: "text",
        },
        {
          id: "date-of-plan-budget",
          question: "Date of Plan (Budget)",
          hint: "(Today's date, being the submission date of this Google form - instead of authorised date)",
          type: "date",
        },
        {
          id: "budget-spending-plan-desired-outcome",
          question: "Budget Spending Plan: Desired Outcome",
          hint: "(Select from options above for each numbered 'row')",
          type: "textarea",
        },
        {
          id: "budget-spending-plan-how-this-will-be-achieved",
          question: "Budget Spending Plan: How this will be achieved",
          hint: "",
          type: "textarea",
        },
        {
          id: "budget-spending-plan-who-by",
          question: "Budget Spending Plan: Who by",
          hint: "(Select from options above for each numbered 'row')",
          type: "textarea",
        },
        {
          id: "budget-spending-plan-how-often",
          question: "Budget Spending Plan: How Often",
          hint: "",
          type: "textarea",
        },
        {
          id: "budget-spending-plan-weekly-cost-",
          question: "Budget Spending Plan: Weekly cost £",
          hint: "",
          type: "textarea",
        },
        {
          id: "budget-spending-plan-yearly-cost-",
          question: "Budget Spending Plan: Yearly cost £",
          hint: "",
          type: "textarea",
        },
        {
          id: "budget-spending-plan-start-date",
          question: "Budget Spending Plan: Start Date",
          hint: "",
          type: "textarea",
        },
        {
          id: "budget-spending-plan-end-date",
          question: "Budget Spending Plan: End Date",
          hint: "",
          type: "textarea",
        },
      ],
    },
    {
      id: "managing-my-budget",
      name: "Managing my budget",
      fields: [
        {
          id: "who-will-manage-my-budget",
          question: "Who will manage my budget?",
          hint: "",
          type: "radios",
          choices: [
            {
              value: "me-via-a-direct-payment",
              label: "Me via a Direct Payment",
            },
            {
              value: "my-representative--via-direct-payment",
              label: "My representative - via Direct Payment",
            },
            {
              value: "local-authority",
              label: "Local Authority",
            },
            {
              value: "other-arrangement-eg-mixed",
              label: "Other arrangement (e.g. mixed)",
            },
          ],
        },
        {
          id: "does-the-identified-representative-have-a-power-of-attorney",
          question:
            "Does the identified representative have a Power of Attorney?",
          hint: "",
          type: "radios",
          choices: [
            {
              value: "yes",
              label: "Yes",
            },
            {
              value: "no",
              label: "No",
            },
            {
              value: "not-applicable",
              label: "Not applicable",
            },
          ],
        },
        {
          id: "list-details-of-those-managing-my-budget",
          question: "List details of those managing my budget",
          hint: "Include 'Name and address', 'Contact Number' and 'Relationship' for each row (individual / organisation)",
          type: "textarea",
        },
        {
          id: "has-this-person-been-given-a-copy-of-the-financial-assessment-form",
          question:
            "Has this person been given a copy of the Financial Assessment form?",
          hint: "",
          type: "radios",
          choices: [
            {
              value: "yes",
              label: "Yes",
            },
            {
              value: "no",
              label: "No",
            },
          ],
        },
        {
          id: "my-contribution-week-to-be-confirmed-by-finance-",
          question: "My contribution (£/week to be confirmed by finance) ",
          hint: "",
          type: "text",
        },
        {
          id: "local-authority-contribution-week-to-be-confirmed-by-finance",
          question:
            "Local Authority contribution (£/week to be confirmed by finance)",
          hint: "",
          type: "text",
        },
        {
          id: "other-contributions-week-",
          question: "Other contributions (£/week) ",
          hint: "",
          type: "text",
        },
        {
          id: "details-budget",
          question: "Details (budget)",
          hint: "",
          type: "textarea",
        },
      ],
    },
    {
      id: "special-funding-arrangements-",
      name: "Special funding arrangements ",
      fields: [
        {
          id: "has-a-ds1500-form-been-issued",
          question: "Has a DS1500 form been issued?",
          hint: "",
          type: "radios",
          choices: [
            {
              value: "yes",
              label: "Yes",
            },
            {
              value: "no",
              label: "No",
            },
            {
              value: "not-known",
              label: "Not known",
            },
          ],
        },
        {
          id: "are-you-entitled-to-section-117-aftercare",
          question: "Are you entitled to Section 117 aftercare?",
          hint: "",
          type: "radios",
          choices: [
            {
              value: "yes",
              label: "Yes",
            },
            {
              value: "no",
              label: "No",
            },
            {
              value: "no-longer",
              label: "No longer",
            },
          ],
        },
        {
          id: "are-you-receiving-care-under-the-care-programme-approach",
          question: "Are you receiving care under the Care Programme Approach?",
          hint: "",
          type: "radios",
          choices: [
            {
              value: "yes",
              label: "Yes",
            },
            {
              value: "no",
              label: "No",
            },
            {
              value: "no-longer",
              label: "No longer",
            },
          ],
        },
      ],
    },
    {
      id: "weekly-timetable",
      name: "Weekly Timetable",
      fields: [
        {
          id: "date-of-timetable",
          question: "Date of Timetable",
          hint: "(Today's date, being the submission date of this Google form - instead of authorised date)",
          type: "date",
        },
        {
          id: "total-weekly-hours-timetable",
          question: "Total weekly hours (Timetable)",
          hint: "(Use decimal notation for part-hours)",
          type: "text",
        },
        {
          id: "other-week",
          question: "Other (£/Week)",
          hint: "",
          type: "text",
        },
        {
          id: "list-details-of-my-weekly-timetable",
          question: "List details of my weekly timetable",
          hint: "Please break this down into 'Day', 'Morning', 'Afternoon', 'Evening', 'Night' and 'Estimated Weekly Cost'",
          type: "textarea",
        },
      ],
    },
  ],
}

export default theme
