import { render, screen, within } from "@testing-library/react"
import { mockFullResident } from "../fixtures/fullResidents"
import ResidentDetailsList from "./ResidentDetailsList"
import useFullResident from "../hooks/useFullResident"

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
    expect(within(row).queryByText("Dementia, Physical disabilities")).toBeVisible()
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
})
