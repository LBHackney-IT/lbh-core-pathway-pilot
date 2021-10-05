import { render, screen } from "@testing-library/react"
import SocialCareIdAnswer, { isSocialCareIdAnswer } from "./SocialCareIdAnswer"

describe("isSocialCareIdAnswer", () => {
  it("correctly identifies social care id-shaped answers", () => {
    const result0 = isSocialCareIdAnswer({
      Name: "a",
      "Social care ID": "b",
      "Date of birth": "c",
    })
    expect(result0).toBeTruthy()

    const result = isSocialCareIdAnswer({
      Name: "",
      "Social care ID": "",
      "Date of birth": "",
    })
    expect(result).toBeFalsy()

    const result2 = isSocialCareIdAnswer({
      Name: "",
    })
    expect(result2).toBeFalsy()

    const result3 = isSocialCareIdAnswer({
      "Social care ID": "",
    })
    expect(result3).toBeFalsy()
  })
})

describe("SocialCareIdAnswer", () => {
  render(
    <SocialCareIdAnswer
      answer={{
        Name: "foo",
        "Social care ID": "bar",
        "Date of birth": "su",
      }}
    />
  )
  expect(screen.getByRole("list"))
  expect(screen.getAllByRole("listitem").length).toBe(3)
  expect(screen.getByRole("link"))
  expect(screen.getByText("#bar"))
})
