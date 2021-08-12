import { Field } from "../../types"

const review: Field[] = [
  {
    id: "Type",
    question: "What type of review is this?",
    type: "radios",
    required: true,
    choices: [
      {
        value: "Planned",
        label: "Planned",
      },
      {
        value: "Unplanned",
        label: "Unplanned",
      },
    ],
  },
  {
    id: "Reason",
    question: "What is the reason for this unplanned review?",
    type: "radios",
    required: true,
    conditions: [
      {
        id: "Type",
        value: "Unplanned",
      },
    ],
    choices: [
      {
        label: "Hospital stay",
        value: "Hospital stay",
      },
      {
        label: "Carer-related",
        value: "Carer-related",
      },
      {
        label: "Safeguarding concern",
        value: "Safeguarding concern",
      },
      {
        label: "Provider failure",
        value: "Provider failure",
      },
      {
        label: "Change in commissioning arrangements",
        value: "Change in commissioning arrangements",
      },
      {
        label: "Something else",
        value: "Something else",
      },
    ],
  },
  {
    id: "How is the care and support working since the last review?",
    question: "How is the care and support working since the last review?",
    type: "textarea",
    required: true,
  },
  {
    id: "Other involved professionals",
    question: "Who else is involved in this review?",
    type: "repeaterGroup",
    subfields: [
      {
        id: "Name",
        question: "Their name",
        type: "text",
      },
      {
        id: "Role",
        question: "Their role",
        type: "select",
        choices: [
          { label: "GP", value: "GP" },
          { label: "Modern matron", value: "Modern matron" },
          { label: "District nurse", value: "District nurse" },
          {
            label: "Secondary Health (Hospital)",
            value: "Secondary Health (Hospital)",
          },
          {
            label: "Secondary Health (ACRT)",
            value: "Secondary Health (ACRT)",
          },
          { label: "OT", value: "OT" },
          { label: "Social Worker", value: "Social Worker" },
          { label: "Sensory", value: "Sensory" },
          {
            label: "Speech and language therapists",
            value: "Speech and language therapists",
          },
          {
            label: "Alcohol and drug services",
            value: "Alcohol and drug services",
          },
          { label: "Children services", value: "Children services" },
          { label: "Mental health services", value: "Mental health services" },
          { label: "LBH housing services", value: "LBH housing services" },
          {
            label: "Non-LBH housing services",
            value: "Non-LBH housing services",
          },
          {
            label: "Voluntary and community services",
            value: "Voluntary and community services",
          },
          { label: "Physio", value: "Physio" },
          { label: "Direct payments team", value: "Direct payments team" },
          {
            label: "Domiciliary or homecare agency",
            value: "Domiciliary or homecare agency",
          },
          { label: "Other", value: "Other" },
        ],
      },
    ],
    itemName: "person",
  },
  {
    id: "Reassessment needed?",
    question: "Is a reassessment needed?",
    hint: "If their needs have changed since the last assessment",
    type: "radios",
    required: true,
    choices: [
      {
        value: "Yes",
        label: "Yes",
      },
      {
        value: "No",
        label: "No",
      },
    ],
  },
  {
    id: "Changes to support plan needed?",
    question: "Is a change to the support plan needed?",
    type: "radios",
    required: true,
    choices: [
      {
        value: "Yes",
        label: "Yes",
      },
      {
        value: "No",
        label: "No",
      },
    ],
  },
]

export default review
