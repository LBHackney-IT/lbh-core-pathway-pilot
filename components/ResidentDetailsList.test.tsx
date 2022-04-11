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
    expect(screen.getByText("Title"))
    expect(screen.getByText(`${mockSuperResident.title}`))
    expect(screen.getByText("First name"))
    expect(screen.getByText(`${mockSuperResident.firstName}`))
    expect(screen.getByText("Last name"))
    expect(screen.getByText(`${mockSuperResident.lastName}`))
    expect(screen.getByText("NHS number"))
    expect(screen.getByText(`${mockSuperResident.nhsNumber}`))
  })

  it("marks not known fields", () => {
    ;(useSuperResident as jest.Mock).mockReturnValue({
      data: { ...mockSuperResident, nhsNumber: null },
    })

    render(
      <ResidentDetailsList socialCareId={mockSuperResident.id.toString()} />
    )

    const row = screen.getByText("NHS number").closest("div")
    expect(within(row).getByText("Not known")).toBeVisible()
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
    expect(within(row).queryByText("Home")).toBeVisible()
    expect(
      within(row).queryByText(`${mockSuperResident.phoneNumbers[0].number}`, {
        exact: false,
      })
    ).toBeVisible()
    expect(within(row).queryByText("Mobile")).toBeVisible()
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

    expect(screen.queryByText("First language")).toBeVisible()
    expect(screen.queryByText(`${mockSuperResident.firstLanguage}`)).toBeVisible()
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
    expect(within(row).queryByText(`${mockSuperResident.preferredMethodOfContact}`)).toBeVisible()
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
})
