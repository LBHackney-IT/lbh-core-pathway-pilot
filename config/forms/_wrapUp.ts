import { Form } from "../../types"

const form: Form = {
  id: "next-steps",
  name: "Next steps",
  themes: [
    {
      id: "next-steps",
      name: "Next steps",
      steps: [
        {
          id: "completed-by",
          name: "Completed by",
          fields: [
            {
              id: "completed-date-conversation-3",
              question: "Completed date (Conversation 3)",
              hint: "",
              type: "date",
            },
            {
              id: "workers-name",
              question: "Workers name",
              hint: "",
              type: "text",
            },
            {
              id: "workers-team",
              question: "Workers team",
              hint: "",
              type: "text",
            },
            {
              id: "managers-name-",
              question: "Managers Name ",
              hint: "",
              type: "text",
            },
          ],
        },
        {
          id: "next-actions",
          name: "Next Actions",
          fields: [
            {
              id: "will-this-conversation-lead-to-a-safeguarding-concern",
              question:
                "Will this Conversation lead to a Safeguarding Concern?",
              hint: "If yes, please ensure you complete an 'Adults - Safeguarding Adult Concern' form",
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
              id: "what-next--workflow",
              question: "What Next - workflow",
              hint: "(if you are not transferring to the Long Term team and the person was also not accepted / eligible for reablement then choose 'Close Case / No Further Action' - e.g. provision of Immediate Services and / or Telecare falls within 'No Further Action' in this sense after you finish Conversation 3)",
              type: "radios",
              choices: [
                {
                  value: "transfer-case-to-long-term-team",
                  label: "Transfer case to Long Term team",
                },
                {
                  value: "transfer-case-to-iit-for-reablement",
                  label: "Transfer case to IIT (for reablement)",
                },
                {
                  value: "close-case-no-further-action",
                  label: "Close Case /No Further Action",
                },
              ],
            },
          ],
        },
        {
          id: "transfer-case-to-long-term-team",
          name: "Transfer case to Long Term team",
          fields: [
            {
              id: "date-of-next-review",
              question: "Date of Next Review",
              hint: "Please schedule a date in 3, 6 or 12 months time, as required, for the Long Term team to carry out a Review",
              type: "date",
            },
          ],
        },
        {
          id: "sequel-to-conversation-3-long-term-team",
          name: "Sequel to Conversation 3 (Long Term Team)",
          fields: [
            {
              id: "outcomes-for-transfer-to-long-term-team-sequel",
              question: "Outcomes for Transfer to Long Term Team (Sequel)",
              hint: "(Choose the first which applies)",
              type: "radios",
              choices: [
                {
                  value: "long-term-support-nursing-care",
                  label: "Long Term Support (Nursing Care)",
                },
                {
                  value: "long-term-support-residential-care",
                  label: "Long Term Support (Residential Care)",
                },
                {
                  value: "long-term-support-community",
                  label: "Long Term Support (Community)",
                },
                {
                  value: "option-4",
                  label: "Option 4",
                },
                {
                  value: "end-of-life-overseen-by-long-term-team",
                  label: "End of Life (overseen by Long Term team)",
                },
              ],
            },
          ],
        },
        {
          id: "sequel-to-conversation-3-reablement",
          name: "Sequel to Conversation 3 (Reablement)",
          fields: [
            {
              id: "outcomes-for-reablement-referral-sequel",
              question: "Outcomes for Reablement Referral (Sequel)",
              hint: "(Only one applies in this case - please select)",
              type: "radios",
              choices: [
                {
                  value:
                    "short-term-support-to-maximise-independence-reablement",
                  label:
                    "Short Term Support to Maximise Independence (Reablement)",
                },
              ],
            },
          ],
        },
        {
          id: "sequel-to-conversation-3-nfa--closure",
          name: "Sequel to Conversation 3 (NFA / Closure)",
          fields: [
            {
              id: "outcomes-for-contact-sequel",
              question: "Outcomes for Contact (Sequel)",
              hint: "(Choose the first which applies)",
              type: "radios",
              choices: [
                {
                  value: "end-of-life-not-overseen-by-long-term-team",
                  label: "End of Life (not overseen by Long Term team)",
                },
                {
                  value:
                    "ongoing-low-level-support-provided-with-telecare-or-equipment--adaptations",
                  label:
                    "Ongoing Low Level Support (provided with Telecare or Equipment / Adaptations)",
                },
                {
                  value:
                    "short-term-support-other-eg-immediate-services--timelimited-support-not-reablement-",
                  label:
                    "Short Term Support (other) (e.g. Immediate Services - Time-limited support; NOT Reablement; )",
                },
                {
                  value: "universal-servicessignposted-to-other-services",
                  label: "Universal Services/Signposted to other services",
                },
                {
                  value: "no-services-provided--deceased",
                  label: "No services provided - Deceased",
                },
                {
                  value: "no-services-provided--other-reason",
                  label: "No services provided - other reason",
                },
              ],
            },
          ],
        },
        {
          id: "manager-approval",
          name: "Manager approval",
          fields: [
            {
              id: "email-address-of-your-manager-who-would-normally-approve-this-decision",
              question:
                "Email address of your manager (who would normally approve this decision)",
              hint: "(Who will retrospectively approve this decision? You need to manually forward the 'receipt' copy of this form to them once you receive it)",
              type: "text",
            },
          ],
        },
      ],
    },
  ],
}

export default form
