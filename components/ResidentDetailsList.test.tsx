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
    render(<ResidentDetailsList socialCareId={mockSuperResident.id.toString()} />);
    expect(screen.getByText("Name"));
    expect(screen.getByText(`${mockSuperResident.firstName} ${mockSuperResident.lastName}`));
  })

  it("marks not known fields", () => {
    ;(useSuperResident as jest.Mock).mockReturnValue({
      data: {...mockSuperResident, nhsNumber: null},
    })

    render(
      <ResidentDetailsList
      socialCareId={mockSuperResident.id.toString()}
      />
    )

   const row = screen.getByText("NHS number").closest("div")
   expect(within(row).getByText("Not known")).toBeVisible()
  })

  it.only("displays addresses", () => {
    render(<ResidentDetailsList socialCareId={mockSuperResident.id.toString()} />)

    const row = screen.getByText("Address").closest("div")
    console.log('row', row)

    expect(within(row).queryByText("123 Town St")).toBeVisible()
    expect(within(row).queryByText("W1A")).toBeVisible()
  })

  it("displays not known if address unknown", () => {
    render(
      <ResidentDetailsList socialCareId={{ ...mockSuperResident, addressList: [] }} />
    )

    const row = screen.getByText("Addresses").closest("div")

    expect(within(row).queryByText("Not known")).toBeVisible()
  })

  it("displays phone numbers", () => {
    render(<ResidentDetailsList socialCareId={mockSuperResident} />)

    const row = screen.getByText("Phone numbers").closest("div")

    expect(within(row).queryAllByRole("list")).toHaveLength(1)
    expect(within(row).queryAllByRole("listitem")).toHaveLength(2)
    expect(within(row).queryByText("Home")).toBeVisible()
    expect(
      within(row).queryByText("020 777 7777", { exact: false })
    ).toBeVisible()
    expect(within(row).queryByText("Mobile")).toBeVisible()
    expect(
      within(row).queryByText("0777 777 7777", { exact: false })
    ).toBeVisible()
  })

  it("displays not known if phone numbers unknown", () => {
    render(
      <ResidentDetailsList socialCareId={{ ...mockSuperResident, phoneNumber: [] }} />
    )

    const row = screen.getByText("Phone numbers").closest("div")

    expect(within(row).queryByText("Not known")).toBeVisible()
  })

  it("filters out historic addresses", () => {
    render(
      <ResidentDetailsList
      socialCareId={{
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
        }}
      />
    )
    expect(screen.getByText("add1", { exact: false }))
    expect(screen.queryByText("add2", { exact: false })).toBeNull()
  })

  it("displays other names if other names exist", () => {
    render(<ResidentDetailsList socialCareId={mockSuperResident} />)

    const row = screen.getByText("Other names").closest("div")

    expect(within(row).queryAllByRole("list")).toHaveLength(1)
    expect(within(row).queryAllByRole("listitem")).toHaveLength(1)
    expect(within(row).queryByText("Jane Doe")).toBeVisible()
  })

  it("displays not known if other names unknown", () => {
    render(
      <ResidentDetailsList socialCareId={{ ...mockSuperResident, otherNames: [] }} />
    )

    const row = screen.getByText("Other names").closest("div")

    expect(within(row).queryByText("Not known")).toBeVisible()
  })

  it("displays first language", () => {
    render(<ResidentDetailsList socialCareId={mockSuperResident} />)

    expect(screen.queryByText("First language")).toBeVisible()
    expect(screen.queryByText("English")).toBeVisible()
  })

  it("displays not known if first language is unknown", () => {
    render(
      <ResidentDetailsList
      socialCareId={{ ...mockSuperResident, firstLanguage: null }}
      />
    )

    const row = screen.getByText("First language").closest("div")

    expect(within(row).queryByText("Not known")).toBeVisible()
  })

  it("displays email address", () => {
    render(<ResidentDetailsList socialCareId={mockSuperResident} />)

    expect(screen.queryByText("Email address")).toBeVisible()
    expect(screen.queryByText("firstname.surname@example.com")).toBeVisible()
  })

  it("displays not known if email address is unknown", () => {
    render(
      <ResidentDetailsList
      socialCareId={{ ...mockSuperResident, emailAddress: null }}
      />
    )

    const row = screen.getByText("Email address").closest("div")

    expect(within(row).queryByText("Not known")).toBeVisible()
  })

  it("displays preferred method of contact", () => {
    render(<ResidentDetailsList socialCareId={mockSuperResident} />)

    expect(screen.queryByText("Preferred method of contact")).toBeVisible()
    expect(screen.queryByText("Email")).toBeVisible()
  })

  it("displays not known if preferred method of contact is unknown", () => {
    render(
      <ResidentDetailsList
      socialCareId={{ ...mockSuperResident, preferredMethodOfContact: null }}
      />
    )

    const row = screen.getByText("Preferred method of contact").closest("div")

    expect(within(row).queryByText("Not known")).toBeVisible()
  })
})
