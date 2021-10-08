import { render, screen } from "@testing-library/react"
import SocialCareIdAnswer, {isSocialCareIdAnswer, providedSocialCareIdAnswer} from "./SocialCareIdAnswer"

describe("isSocialCareIdAnswer", () => {
  it("correctly identifies social care id-shaped answers", () => {
    expect(isSocialCareIdAnswer({
      Name: "a",
      "Social care ID": "b",
      "Date of birth": "c",
    })).toBeTruthy()

    expect(isSocialCareIdAnswer({
      Name: "",
      "Social care ID": "123",
      "Date of birth": "",
    })).toBeTruthy()

    expect(isSocialCareIdAnswer({
      Name: "",
      "Social care ID": "",
      "Date of birth": "",
    })).toBeTruthy()

    expect(isSocialCareIdAnswer({
      Name: "",
    })).toBeFalsy()

    expect(isSocialCareIdAnswer({
      "Social care ID": "",
    })).toBeFalsy()
  })
})

describe("providedSocialCareIdAnswer", () => {
  it("correctly identifies completed social care id answers", () => {
    expect(providedSocialCareIdAnswer({
      Name: "a",
      "Social care ID": "b",
      "Date of birth": "c",
    })).toBeTruthy()

    expect(providedSocialCareIdAnswer({
      Name: "",
      "Social care ID": "",
      "Date of birth": "",
    })).toBeFalsy()

    expect(providedSocialCareIdAnswer({
      Name: "",
      "Social care ID": "123123",
      "Date of birth": "",
    })).toBeTruthy()

    expect(providedSocialCareIdAnswer({
      Name: "",
    })).toBeFalsy()

    expect(providedSocialCareIdAnswer({
      "Social care ID": "",
    })).toBeFalsy()
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
