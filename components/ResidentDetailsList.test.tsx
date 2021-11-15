import { render, screen, within } from "@testing-library/react"
import { mockResident } from "../fixtures/residents"
import ResidentDetailsList from "./ResidentDetailsList"

describe("ResidentDetailsList", () => {
  it("renders basic info", () => {
    render(<ResidentDetailsList resident={mockResident} />)
    expect(screen.getByText("Name"))
    expect(screen.getByText("Firstname Surname"))
  })

  it("marks not known fields", () => {
    render(
      <ResidentDetailsList
        resident={{
          ...mockResident,
          nhsNumber: null,
        }}
      />
    )
    expect(screen.getByText("Not known"))
  })

  it("displays addresses", () => {
    render(<ResidentDetailsList resident={mockResident} />)

    const row = screen.getByText("Addresses").closest("div")

    expect(within(row).queryAllByRole("list")).toHaveLength(1)
    expect(within(row).queryAllByRole("listitem")).toHaveLength(1)
    expect(within(row).queryByText("123 Town St, W1A")).toBeVisible()
  })

  it("displays not known if address unknown", () => {
    render(
      <ResidentDetailsList resident={{ ...mockResident, addressList: [] }} />
    )

    const row = screen.getByText("Addresses").closest("div")

    expect(within(row).queryByText("Not known")).toBeVisible()
  })

  it("displays phone numbers", () => {
    render(<ResidentDetailsList resident={mockResident} />)

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
      <ResidentDetailsList resident={{ ...mockResident, phoneNumber: [] }} />
    )

    const row = screen.getByText("Phone numbers").closest("div")

    expect(within(row).queryByText("Not known")).toBeVisible()
  })

  it("filters out historic addresses", () => {
    render(
      <ResidentDetailsList
        resident={{
          ...mockResident,
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
    render(<ResidentDetailsList resident={mockResident} />)

    const row = screen.getByText("Other names").closest("div")

    expect(within(row).queryAllByRole("list")).toHaveLength(1)
    expect(within(row).queryAllByRole("listitem")).toHaveLength(1)
    expect(within(row).queryByText("Jane Doe")).toBeVisible()
  })

  it("displays not known if other names unknown", () => {
    render(
      <ResidentDetailsList resident={{ ...mockResident, otherNames: [] }} />
    )

    const row = screen.getByText("Other names").closest("div")

    expect(within(row).queryByText("Not known")).toBeVisible()
  })

  it("displays first language", () => {
    render(<ResidentDetailsList resident={mockResident} />)

    expect(screen.queryByText("First language")).toBeVisible()
    expect(screen.queryByText("English")).toBeVisible()
  })

  it("displays not known if first language is unknown", () => {
    render(
      <ResidentDetailsList
        resident={{ ...mockResident, firstLanguage: null }}
      />
    )

    const row = screen.getByText("First language").closest("div")

    expect(within(row).queryByText("Not known")).toBeVisible()
  })

  it("displays email address", () => {
    render(<ResidentDetailsList resident={mockResident} />)

    expect(screen.queryByText("Email address")).toBeVisible()
    expect(screen.queryByText("firstname.surname@example.com")).toBeVisible()
  })

  it("displays not known if email address is unknown", () => {
    render(
      <ResidentDetailsList
        resident={{ ...mockResident, emailAddress: null }}
      />
    )

    const row = screen.getByText("Email address").closest("div")

    expect(within(row).queryByText("Not known")).toBeVisible()
  })

  it("displays preferred method of contact", () => {
    render(<ResidentDetailsList resident={mockResident} />)

    expect(screen.queryByText("Preferred method of contact")).toBeVisible()
    expect(screen.queryByText("Email")).toBeVisible()
  })

  it("displays not known if preferred method of contact is unknown", () => {
    render(
      <ResidentDetailsList
        resident={{ ...mockResident, preferredMethodOfContact: null }}
      />
    )

    const row = screen.getByText("Preferred method of contact").closest("div")

    expect(within(row).queryByText("Not known")).toBeVisible()
  })
})
