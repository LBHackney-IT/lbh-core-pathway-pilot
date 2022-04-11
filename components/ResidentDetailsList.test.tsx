import { render, screen, within } from "@testing-library/react"
import { mockSuperResident } from "../fixtures/superResidents"
import ResidentDetailsList from "./ResidentDetailsList"
import useSuperResident from "../hooks/useSuperResident"

jest.mock("../hooks/useSuperResident")

describe("components/ResidentDetailsList", () => {
  ;(useSuperResident as jest.Mock).mockReturnValue({
    data: mockSuperResident,
  })

  it("renders basic info", () => {
    render(
      <ResidentDetailsList socialCareId={mockSuperResident.id.toString()} />
    )

    const rowId = screen.getByText("Social care ID").closest("div")
    expect(within(rowId).getByText(`${mockSuperResident.id}`)).toBeVisible()
    const rowTitle = screen.getByText("Title").closest("div")
    expect(within(rowTitle).getByText(`${mockSuperResident.title}`)).toBeVisible()
    const rowFirstName = screen.getByText("First name").closest("div")
    expect(within(rowFirstName).getByText(`${mockSuperResident.firstName}`)).toBeVisible()
    const rowLastName = screen.getByText("Last name").closest("div")
    expect(within(rowLastName).getByText(`${mockSuperResident.lastName}`)).toBeVisible()
    const rowNHS = screen.getByText("NHS number").closest("div")
    expect(within(rowNHS).getByText(`${mockSuperResident.nhsNumber}`)).toBeVisible()
    const rowPronoun = screen.getByText("Pronoun").closest("div")
    expect(within(rowPronoun).getByText(`${mockSuperResident.pronoun}`)).toBeVisible()
    const rowSexualOrientation = screen.getByText("Sexual orientation").closest("div")
    expect(within(rowSexualOrientation).getByText(`${mockSuperResident.sexualOrientation}`)).toBeVisible()

  })

  it("marks not known fields", () => {
    ;(useSuperResident as jest.Mock).mockReturnValue({
      data: {
        ...mockSuperResident,
        nhsNumber: null,
        title: null,
        firstName: null,
        lastName: null,
        pronoun: null,
        sexualOrientation: null,
      },
    })

    render(
      <ResidentDetailsList socialCareId={mockSuperResident.id.toString()} />
    )

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
    const rowSexualOrientation = screen.getByText("Sexual orientation").closest("div")
    expect(within(rowSexualOrientation).getByText("Not known")).toBeVisible()
  })

  it("displays gender", () => {
    render(
      <ResidentDetailsList socialCareId={mockSuperResident.id.toString()} />
    )

    const row = screen.getByText("Gender").closest("div")
    expect(within(row).queryByText("Female")).toBeVisible()
  })

  it("displays not known if gender is unknown", () => {
    ;(useSuperResident as jest.Mock).mockReturnValue({
      data: {
        ...mockSuperResident,
        gender: null,
      },
    })
    render(
      <ResidentDetailsList socialCareId={mockSuperResident.id.toString()} />
    )

    const row = screen.getByText("Gender").closest("div")
    expect(within(row).queryByText("Not known")).toBeVisible()
  })

  it("displays gender assigned at birth", () => {
    render(
      <ResidentDetailsList socialCareId={mockSuperResident.id.toString()} />
    )

    const row = screen
      .getByText("Same gender as assigned at birth?")
      .closest("div")
    expect(within(row).queryByText("Yes")).toBeVisible()
  })

  it("displays not known if gender assigned at birth is unknown", () => {
    ;(useSuperResident as jest.Mock).mockReturnValue({
      data: {
        ...mockSuperResident,
        genderAssignedAtBirth: null,
      },
    })
    render(
      <ResidentDetailsList socialCareId={mockSuperResident.id.toString()} />
    )

    const row = screen
      .getByText("Same gender as assigned at birth?")
      .closest("div")
    expect(within(row).queryByText("Not known")).toBeVisible()
  })

  it("displays addresses", () => {
    render(
      <ResidentDetailsList socialCareId={mockSuperResident.id.toString()} />
    )

    const row = screen.getByText("Address").closest("div")

    expect(
      within(row).queryByText(`${mockSuperResident.address.address}`, {
        exact: false,
      })
    ).toBeVisible()
    expect(
      within(row).queryByText(`${mockSuperResident.address.postcode}`, {
        exact: false,
      })
    ).toBeVisible()
  })

  it("displays not known if address unknown", () => {
    ;(useSuperResident as jest.Mock).mockReturnValue({
      data: {
        ...mockSuperResident,
        address: {
          address: null,
          postcode: null,
        },
      },
    })
    render(
      <ResidentDetailsList socialCareId={mockSuperResident.id.toString()} />
    )

    const row = screen.getByText("Address").closest("div")
    expect(within(row).queryByText("Not known")).toBeVisible()
  })

  it("displays phone numbers", () => {
    render(
      <ResidentDetailsList socialCareId={mockSuperResident.id.toString()} />
    )

    const row = screen.getByText("Phone numbers").closest("div")

    expect(within(row).queryAllByRole("list")).toHaveLength(1)
    expect(within(row).queryAllByRole("listitem")).toHaveLength(2)
    expect(within(row).queryByText(`${mockSuperResident.phoneNumbers[0].type}`)).toBeVisible()
    expect(
      within(row).queryByText(`${mockSuperResident.phoneNumbers[0].number}`, {
        exact: false,
      })
    ).toBeVisible()
    expect(within(row).queryByText(`${mockSuperResident.phoneNumbers[1].type}`)).toBeVisible()
    expect(
      within(row).queryByText(`${mockSuperResident.phoneNumbers[1].number}`, {
        exact: false,
      })
    ).toBeVisible()
  })

  it("displays not known if phone numbers unknown", () => {
    ;(useSuperResident as jest.Mock).mockReturnValue({
      data: {
        ...mockSuperResident,
        phoneNumbers: [],
      },
    })
    render(
      <ResidentDetailsList socialCareId={mockSuperResident.id.toString()} />
    )

    const row = screen.getByText("Phone numbers").closest("div")

    expect(within(row).queryByText("Not known")).toBeVisible()
  })

  xit("filters out historic addresses", () => {
    // Redundant???
    ;(useSuperResident as jest.Mock).mockReturnValue({
      data: {
        ...mockSuperResident,
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
      <ResidentDetailsList socialCareId={mockSuperResident.id.toString()} />
    )

    expect(screen.getByText("add1", { exact: false }))
    expect(screen.queryByText("add2", { exact: false })).toBeNull()
  })

  it("displays other names if other names exist", () => {
    render(
      <ResidentDetailsList socialCareId={mockSuperResident.id.toString()} />
    )

    const row = screen.getByText("Other names").closest("div")

    expect(within(row).queryAllByRole("list")).toHaveLength(1)
    expect(within(row).queryAllByRole("listitem")).toHaveLength(1)
    expect(
      within(row).queryByText(
        `${mockSuperResident.otherNames[0].firstName} ${mockSuperResident.otherNames[0].lastName}`
      )
    ).toBeVisible()
  })

  it("displays not known if other names unknown", () => {
    ;(useSuperResident as jest.Mock).mockReturnValue({
      data: {
        ...mockSuperResident,
        otherNames: [],
      },
    })
    render(
      <ResidentDetailsList socialCareId={mockSuperResident.id.toString()} />
    )

    const row = screen.getByText("Other names").closest("div")

    expect(within(row).queryByText("Not known")).toBeVisible()
  })

  it("displays first language", () => {
    render(
      <ResidentDetailsList socialCareId={mockSuperResident.id.toString()} />
    )

    const row = screen.getByText("First language").closest("div")
    expect(
      within(row).queryByText(`${mockSuperResident.firstLanguage}`)
    ).toBeVisible()
  })

  it("displays not known if first language is unknown", () => {
    ;(useSuperResident as jest.Mock).mockReturnValue({
      data: {
        ...mockSuperResident,
        firstLanguage: null,
      },
    })
    render(
      <ResidentDetailsList socialCareId={mockSuperResident.id.toString()} />
    )

    const row = screen.getByText("First language").closest("div")

    expect(within(row).queryByText("Not known")).toBeVisible()
  })

  it("displays email address", () => {
    render(
      <ResidentDetailsList socialCareId={mockSuperResident.id.toString()} />
    )

    const row = screen.getByText("Email address").closest("div")

    expect(
      within(row).queryByText(`${mockSuperResident.emailAddress}`)
    ).toBeVisible()
  })

  it("displays not known if email address is unknown", () => {
    ;(useSuperResident as jest.Mock).mockReturnValue({
      data: {
        ...mockSuperResident,
        emailAddress: null,
      },
    })
    render(
      <ResidentDetailsList socialCareId={mockSuperResident.id.toString()} />
    )

    const row = screen.getByText("Email address").closest("div")

    expect(within(row).queryByText("Not known")).toBeVisible()
  })

  it("displays preferred method of contact", () => {
    render(
      <ResidentDetailsList socialCareId={mockSuperResident.id.toString()} />
    )

    const row = screen.getByText("Contact preference").closest("div")
    expect(
      within(row).queryByText(`${mockSuperResident.preferredMethodOfContact}`)
    ).toBeVisible()
  })

  it("displays not known if preferred method of contact is unknown", () => {
    ;(useSuperResident as jest.Mock).mockReturnValue({
      data: {
        ...mockSuperResident,
        preferredMethodOfContact: null,
      },
    })
    render(
      <ResidentDetailsList socialCareId={mockSuperResident.id.toString()} />
    )

    const row = screen.getByText("Contact preference").closest("div")
    expect(within(row).queryByText("Not known")).toBeVisible()
  })

  it("displays key contacts", () => {
    render(
      <ResidentDetailsList socialCareId={mockSuperResident.id.toString()} />
    )

    const row = screen.getByText("Key contacts").closest("div")

    expect(within(row).queryAllByRole("list")).toHaveLength(1)
    expect(within(row).queryAllByRole("listitem")).toHaveLength(2)
    expect(within(row).queryByText(`${mockSuperResident.keyContacts[0].name}:`)).toBeVisible()
    expect(
      within(row).queryByText(`${mockSuperResident.keyContacts[0].email}`)
    ).toBeVisible()
    expect(within(row).queryByText(`${mockSuperResident.keyContacts[1].name}:`)).toBeVisible()
    expect(
      within(row).queryByText(`${mockSuperResident.keyContacts[1].email}`, {
        exact: false,
      })
    ).toBeVisible()
  })

  it("displays not known if key contacts unknown", () => {
    ;(useSuperResident as jest.Mock).mockReturnValue({
      data: {
        ...mockSuperResident,
        keyContacts: [],
      },
    })
    render(
      <ResidentDetailsList socialCareId={mockSuperResident.id.toString()} />
    )

    const row = screen.getByText("Key contacts").closest("div")
    expect(within(row).queryByText("Not known")).toBeVisible()
  })
})
