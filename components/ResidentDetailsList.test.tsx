import { render, screen, within } from "@testing-library/react"
import { mockFullResident } from "../fixtures/fullResidents"
import ResidentDetailsList from "./ResidentDetailsList"
import useFullResident from "../hooks/useFullResident"
import { prettyDate, prettyTime } from "../lib/formatters"

jest.mock("../hooks/useFullResident")

describe("components/ResidentDetailsList", () => {
  ;(useFullResident as jest.Mock).mockReturnValue({
    data: mockFullResident,
  })

  it("renders basic info", () => {
    render(
      <ResidentDetailsList socialCareId={mockFullResident.id.toString()} />
    )

    const rowId = screen.getByText("Social care ID").closest("div")
    expect(within(rowId).getByText(`${mockFullResident.id}`)).toBeVisible()
    const rowTitle = screen.getByText("Title").closest("div")
    expect(
      within(rowTitle).getByText(`${mockFullResident.title}`)
    ).toBeVisible()
    const rowFirstName = screen.getByText("First name").closest("div")
    expect(
      within(rowFirstName).getByText(`${mockFullResident.firstName}`)
    ).toBeVisible()
    const rowLastName = screen.getByText("Last name").closest("div")
    expect(
      within(rowLastName).getByText(`${mockFullResident.lastName}`)
    ).toBeVisible()
    const rowNHS = screen.getByText("NHS number").closest("div")
    expect(
      within(rowNHS).getByText(`${mockFullResident.nhsNumber}`)
    ).toBeVisible()
    const rowPronoun = screen.getByText("Pronoun").closest("div")
    expect(
      within(rowPronoun).getByText(`${mockFullResident.pronoun}`)
    ).toBeVisible()
  })

  it("marks not known fields", () => {
    ;(useFullResident as jest.Mock).mockReturnValue({
      data: {
        ...mockFullResident,
        id: null,
        nhsNumber: null,
        title: null,
        firstName: null,
        lastName: null,
        pronoun: null,
      },
    })

    render(
      <ResidentDetailsList socialCareId={mockFullResident.id.toString()} />
    )

    const rowId = screen.getByText("Social care ID").closest("div")
    expect(within(rowId).getByText("Not known")).toBeVisible()
    const rowTitle = screen.getByText("Title").closest("div")
    expect(within(rowTitle).getByText("Not known")).toBeVisible()
    const rowFirstName = screen.getByText("First name").closest("div")
    expect(within(rowFirstName).getByText("Not known")).toBeVisible()
    const rowLastName = screen.getByText("Last name").closest("div")
    expect(within(rowLastName).getByText("Not known")).toBeVisible()
    const rowNHS = screen.getByText("NHS number").closest("div")
    expect(within(rowNHS).getByText("Not known")).toBeVisible()
    const rowPronoun = screen.getByText("Pronoun").closest("div")
    expect(within(rowPronoun).getByText("Not known")).toBeVisible()
  })

  it("displays fluent in english", () => {
    render(
      <ResidentDetailsList socialCareId={mockFullResident.id.toString()} />
    )

    const row = screen.getByText("Fluent in English?").closest("div")
    expect(within(row).queryByText("Yes")).toBeVisible()
  })

  it("displays not known if fluent in english is unknown", () => {
    ;(useFullResident as jest.Mock).mockReturnValue({
      data: {
        ...mockFullResident,
        fluentInEnglish: null,
      },
    })
    render(
      <ResidentDetailsList socialCareId={mockFullResident.id.toString()} />
    )

    const row = screen.getByText("Fluent in English?").closest("div")
    expect(within(row).queryByText("Not known")).toBeVisible()
  })

  it("displays addresses", () => {
    render(
      <ResidentDetailsList socialCareId={mockFullResident.id.toString()} />
    )

    const row = screen.getByText("Address").closest("div")

    expect(
      within(row).queryByText(`${mockFullResident.address.address}`, {
        exact: false,
      })
    ).toBeVisible()
    expect(
      within(row).queryByText(`${mockFullResident.address.postcode}`, {
        exact: false,
      })
    ).toBeVisible()
  })

  it("displays not known if address unknown", () => {
    ;(useFullResident as jest.Mock).mockReturnValue({
      data: {
        ...mockFullResident,
        address: {
          address: null,
          postcode: null,
        },
      },
    })
    render(
      <ResidentDetailsList socialCareId={mockFullResident.id.toString()} />
    )

    const row = screen.getByText("Address").closest("div")
    expect(within(row).queryByText("Not known")).toBeVisible()
  })

  it("displays phone numbers", () => {
    render(
      <ResidentDetailsList socialCareId={mockFullResident.id.toString()} />
    )

    const row = screen.getByText("Phone numbers").closest("div")

    expect(within(row).queryAllByRole("list")).toHaveLength(1)
    expect(within(row).queryAllByRole("listitem")).toHaveLength(2)
    expect(
      within(row).queryByText(`${mockFullResident.phoneNumbers[0].type}`)
    ).toBeVisible()
    expect(
      within(row).queryByText(`${mockFullResident.phoneNumbers[0].number}`, {
        exact: false,
      })
    ).toBeVisible()
    expect(
      within(row).queryByText(`${mockFullResident.phoneNumbers[1].type}`)
    ).toBeVisible()
    expect(
      within(row).queryByText(`${mockFullResident.phoneNumbers[1].number}`, {
        exact: false,
      })
    ).toBeVisible()
  })

  it("displays not known if phone numbers unknown", () => {
    ;(useFullResident as jest.Mock).mockReturnValue({
      data: {
        ...mockFullResident,
        phoneNumbers: [],
      },
    })
    render(
      <ResidentDetailsList socialCareId={mockFullResident.id.toString()} />
    )

    const row = screen.getByText("Phone numbers").closest("div")

    expect(within(row).queryByText("Not known")).toBeVisible()
  })

  xit("filters out historic addresses", () => {
    // Redundant???
    ;(useFullResident as jest.Mock).mockReturnValue({
      data: {
        ...mockFullResident,
        addressList: [
          {
            addressLine1: "add1",
          },
          {
            addressLine1: "add2",
            endDate: "blah",
          },
        ],
      },
    })
    render(
      <ResidentDetailsList socialCareId={mockFullResident.id.toString()} />
    )

    expect(screen.getByText("add1", { exact: false }))
    expect(screen.queryByText("add2", { exact: false })).toBeNull()
  })

  it("displays other names if other names exist", () => {
    render(
      <ResidentDetailsList socialCareId={mockFullResident.id.toString()} />
    )

    const row = screen.getByText("Other names").closest("div")

    expect(within(row).queryAllByRole("list")).toHaveLength(1)
    expect(within(row).queryAllByRole("listitem")).toHaveLength(1)
    expect(
      within(row).queryByText(
        `${mockFullResident.otherNames[0].firstName} ${mockFullResident.otherNames[0].lastName}`
      )
    ).toBeVisible()
  })

  it("displays not known if other names unknown", () => {
    ;(useFullResident as jest.Mock).mockReturnValue({
      data: {
        ...mockFullResident,
        otherNames: [],
      },
    })
    render(
      <ResidentDetailsList socialCareId={mockFullResident.id.toString()} />
    )

    const row = screen.getByText("Other names").closest("div")

    expect(within(row).queryByText("Not known")).toBeVisible()
  })

  it("displays first language", () => {
    render(
      <ResidentDetailsList socialCareId={mockFullResident.id.toString()} />
    )

    const row = screen.getByText("First language").closest("div")
    expect(
      within(row).queryByText(`${mockFullResident.firstLanguage}`)
    ).toBeVisible()
  })

  it("displays not known if first language is unknown", () => {
    ;(useFullResident as jest.Mock).mockReturnValue({
      data: {
        ...mockFullResident,
        firstLanguage: null,
      },
    })
    render(
      <ResidentDetailsList socialCareId={mockFullResident.id.toString()} />
    )

    const row = screen.getByText("First language").closest("div")

    expect(within(row).queryByText("Not known")).toBeVisible()
  })

  it("displays email address", () => {
    render(
      <ResidentDetailsList socialCareId={mockFullResident.id.toString()} />
    )

    const row = screen.getByText("Email address").closest("div")

    expect(
      within(row).queryByText(`${mockFullResident.emailAddress}`)
    ).toBeVisible()
  })

  it("displays not known if email address is unknown", () => {
    ;(useFullResident as jest.Mock).mockReturnValue({
      data: {
        ...mockFullResident,
        emailAddress: null,
      },
    })
    render(
      <ResidentDetailsList socialCareId={mockFullResident.id.toString()} />
    )

    const row = screen.getByText("Email address").closest("div")

    expect(within(row).queryByText("Not known")).toBeVisible()
  })

  it("displays date of birth", () => {
    render(
      <ResidentDetailsList socialCareId={mockFullResident.id.toString()} />
    )

    const row = screen.getByText("Date of birth").closest("div")
    expect(within(row).queryByText("1 Oct 2000")).toBeVisible()
  })

  it("displays not known if date of birth unknown", () => {
    ;(useFullResident as jest.Mock).mockReturnValue({
      data: {
        ...mockFullResident,
        dateOfBirth: null,
      },
    })
    render(
      <ResidentDetailsList socialCareId={mockFullResident.id.toString()} />
    )

    const row = screen.getByText("Date of birth").closest("div")
    expect(within(row).queryByText("Not known")).toBeVisible()
  })

  it("displays context flag", () => {
    render(
      <ResidentDetailsList socialCareId={mockFullResident.id.toString()} />
    )

    const row = screen.getByText("Service area").closest("div")
    expect(within(row).queryByText("Adult social care")).toBeVisible()
  })

  it("displays not known context flag", () => {
    ;(useFullResident as jest.Mock).mockReturnValue({
      data: {
        ...mockFullResident,
        contextFlag: undefined,
      },
    })
    render(
      <ResidentDetailsList socialCareId={mockFullResident.id.toString()} />
    )

    const row = screen.getByText("Service area").closest("div")
    expect(within(row).queryByText("Not known")).toBeVisible()
  })

  it("displays GP Details", () => {
    render(
      <ResidentDetailsList socialCareId={mockFullResident.id.toString()} />
    )

    const row = screen.getByText("GP").closest("div")
    expect(
      within(row).queryByText(`${mockFullResident.gpDetails.name}`)
    ).toBeVisible()
    expect(
      within(row).queryByText(`${mockFullResident.gpDetails.address}`)
    ).toBeVisible()
    expect(
      within(row).queryByText(`${mockFullResident.gpDetails.postcode}`)
    ).toBeVisible()
    expect(
      within(row).queryByText(`${mockFullResident.gpDetails.phoneNumber}`)
    ).toBeVisible()
    expect(
      within(row).queryByText(`${mockFullResident.gpDetails.email}`)
    ).toBeVisible()
  })

  it("displays not known GP details", () => {
    ;(useFullResident as jest.Mock).mockReturnValue({
      data: {
        ...mockFullResident,
        gpDetails: null,
      },
    })
    render(
      <ResidentDetailsList socialCareId={mockFullResident.id.toString()} />
    )

    const row = screen.getByText("GP").closest("div")
    expect(within(row).queryByText("Not known")).toBeVisible()
  })

  it("displays ethnicity from code", () => {
    render(
      <ResidentDetailsList socialCareId={mockFullResident.id.toString()} />
    )

    const row = screen.getByText("Ethnicity").closest("div")
    expect(within(row).queryByText("Turkish Cypriot")).toBeVisible()
  })
  it("displays ethnicity from text", () => {
    ;(useFullResident as jest.Mock).mockReturnValue({
      data: {
        ...mockFullResident,
        ethnicity: "Turkish Cypriot",
      },
    })
    render(
      <ResidentDetailsList socialCareId={mockFullResident.id.toString()} />
    )

    const row = screen.getByText("Ethnicity").closest("div")
    expect(within(row).queryByText("Turkish Cypriot")).toBeVisible()
  })

  it("displays not known ethnicity", () => {
    ;(useFullResident as jest.Mock).mockReturnValue({
      data: {
        ...mockFullResident,
        ethnicity: null,
      },
    })
    render(
      <ResidentDetailsList socialCareId={mockFullResident.id.toString()} />
    )

    const row = screen.getByText("Ethnicity").closest("div")
    expect(within(row).queryByText("Not known")).toBeVisible()
  })

  it("displays disability", () => {
    render(
      <ResidentDetailsList socialCareId={mockFullResident.id.toString()} />
    )

    const row = screen.getByText("Disabilities").closest("div")
    expect(
      within(row).queryByText("Dementia, Physical disabilities")
    ).toBeVisible()
  })

  it("displays not known if disabilities unknown", () => {
    ;(useFullResident as jest.Mock).mockReturnValue({
      data: {
        ...mockFullResident,
        disabilities: [],
      },
    })
    render(
      <ResidentDetailsList socialCareId={mockFullResident.id.toString()} />
    )

    const row = screen.getByText("Disabilities").closest("div")
    expect(within(row).queryByText("Not known")).toBeVisible()
  })

  describe("shows different field sets and updated date depending on snapshot availability and workflow submitted", () => {
    it("shows the complete set of fields if the workflow is submitted and there is a snapshot", () => {
      ;(useFullResident as jest.Mock).mockReturnValue({
        data: {
          ...mockFullResident,
          ethnicity: "A.A10",
          fromSnapshot: true,
          workflowSubmittedAt: "2021-08-04T10:11:40.593Z" as unknown as Date,
        },
      })

      render(
        <ResidentDetailsList
          socialCareId={mockFullResident.id.toString()}
          workflowId={"123"}
        />
      )

      const pronounRow = screen.queryByText("Pronoun").closest("div")
      const ethnicityRow = screen.queryByText("Ethnicity").closest("div")
      const disabilityRow = screen.queryByText("Disabilities").closest("div")
      expect(
        within(pronounRow).getByText(`${mockFullResident.pronoun}`)
      ).toBeVisible()
      expect(within(ethnicityRow).queryByText("Greek Cypriot")).toBeVisible()
      expect(
        within(disabilityRow).queryByText("Dementia, Physical disabilities")
      ).toBeVisible()
    })
    it("shows the date the workflow was submitted if the workflow is submitted and there is a snapshot", () => {
      ;(useFullResident as jest.Mock).mockReturnValue({
        data: {
          ...mockFullResident,
          ethnicity: "A.A10",
          fromSnapshot: true,
          workflowSubmittedAt: "2021-08-04T10:11:40.593Z" as unknown as Date,
        },
      })

      render(
        <ResidentDetailsList
          socialCareId={mockFullResident.id.toString()}
          workflowId={"123"}
        />
      )

      expect(
        screen.getByText(
          /The resident details data shown below was last updated on 4 Aug 2021 at 11:11 AM when the workflow was approved. Contact the support email if you need to know what the data was on an earlier date./
        )
      ).toBeVisible()
    })
    it("shows the complete set of fields if the workflow is not submitted and there is no snapshot", () => {
      ;(useFullResident as jest.Mock).mockReturnValue({
        data: {
          ...mockFullResident,
          fromSnapshot: false,
          workflowSubmittedAt: "",
        },
      })

      render(
        <ResidentDetailsList
          socialCareId={mockFullResident.id.toString()}
          workflowId={"123"}
        />
      )

      const pronounRow = screen.queryByText("Pronoun").closest("div")
      const ethnicityRow = screen.queryByText("Ethnicity").closest("div")
      const disabilityRow = screen.queryByText("Disabilities").closest("div")
      expect(
        within(pronounRow).getByText(`${mockFullResident.pronoun}`)
      ).toBeVisible()
      expect(within(ethnicityRow).queryByText("Turkish Cypriot")).toBeVisible()
      expect(
        within(disabilityRow).queryByText("Dementia, Physical disabilities")
      ).toBeVisible()
    })
    it("shows different text if the workflow is not submitted and there is no snapshot", () => {
      ;(useFullResident as jest.Mock).mockReturnValue({
        data: {
          ...mockFullResident,
          fromSnapshot: false,
          workflowSubmittedAt: "",
        },
      })

      render(
        <ResidentDetailsList
          socialCareId={mockFullResident.id.toString()}
          workflowId={"123"}
        />
      )

      expect(
        screen.getByText("The resident details data shown are up to date.")
      ).toBeVisible()
    })
    it("shows the reduced set of fields if the workflow is submitted and there is no snapshot", () => {
      ;(useFullResident as jest.Mock).mockReturnValue({
        data: {
          ...mockFullResident,
          fromSnapshot: false,
          workflowSubmittedAt: "2021-08-04T10:11:40.593Z" as unknown as Date,
        },
      })

      render(
        <ResidentDetailsList
          socialCareId={mockFullResident.id.toString()}
          workflowId={"123"}
        />
      )

      const idRow = screen.getByText("Social care ID").closest("div")
      expect(within(idRow).getByText(`${mockFullResident.id}`)).toBeVisible()
      const nameRow = screen.getByText("Name").closest("div")
      expect(
        within(nameRow).getByText(
          `${mockFullResident.firstName} ${mockFullResident.lastName}`
        )
      ).toBeVisible()
      const firstLanguageRow = screen.getByText("First language").closest("div")
      expect(
        within(firstLanguageRow).queryByText(
          `${mockFullResident.firstLanguage}`
        )
      ).toBeVisible()

      const pronounRow = screen.queryByText("Pronoun")
      const ethnicityRow = screen.queryByText("Ethnicity")
      const disabilityRow = screen.queryByText("Disabilities")
      expect(pronounRow).toBeNull()
      expect(ethnicityRow).toBeNull()
      expect(disabilityRow).toBeNull()
    })
    it("shows certain text if the workflow is submitted and there is no snapshot", () => {
      ;(useFullResident as jest.Mock).mockReturnValue({
        data: {
          ...mockFullResident,
          fromSnapshot: false,
          workflowSubmittedAt: "2021-08-04T10:11:40.593Z" as unknown as Date,
        },
      })

      render(
        <ResidentDetailsList
          socialCareId={mockFullResident.id.toString()}
          workflowId={"123"}
        />
      )

      expect(
        screen.getByText("The resident details data on this workflow may have been updated after the workflow was approved. Contact the support email if you need to know how the data may have changed.")
      ).toBeVisible()
    })
    it("shows doesn't show a timestamp if there is no workflow id and there is no snapshot", () => {
      ;(useFullResident as jest.Mock).mockReturnValue({
        data: {
          ...mockFullResident,
          fromSnapshot: false,
        },
      })

      const currentDate = new Date()
      render(
        <ResidentDetailsList
          socialCareId={mockFullResident.id.toString()}
        />
      )

      expect(
        screen.queryByText(`${prettyDate(currentDate.toISOString())}`, {
          exact: false,
        })
      ).toBeNull()
      expect(
        screen.queryByText(`${prettyTime(currentDate.toISOString())}`, {
          exact: false,
        })
      ).toBeNull()
      expect(screen.queryByText(/The resident details data/)).not.toBeInTheDocument()
    })
  })
})
