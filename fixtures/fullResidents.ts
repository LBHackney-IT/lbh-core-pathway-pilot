import { FullResident } from "../components/ResidentDetailsList.types"

export const mockFullResident: FullResident = {
  id: 123,
  nhsNumber: 456,
  title: "Mrs",
  firstName: "Resident Firstname",
  lastName: "Resident Surname",
  otherNames: [{ firstName: "Jane", lastName: "Doe" }],
  gender: "F",
  pronoun: "She/Her",
  genderAssignedAtBirth: true,
  address: {
    address: "123 Town St",
    postcode: "W1A",
  },
  emailAddress: "firstname.surname@example.com",
  preferredMethodOfContact: "Email",
  sexualOrientation: "Prefer not to say",
  keyContacts: [
    { name: "Frank", email: "firstname.surname@example.com" },
    { name: "someone", email: "test@example.com" },
  ],
  techUse: ["Mobile phone", "Internet"],
  dateOfBirth: "2000-10-01",
  ethnicity: "A.A12",
  phoneNumbers: [
    { number: "020 777 7777", type: "Home" },
    { number: "0123456778", type: "Mobile" },
  ],
  contextFlag: "A",
  createdBy: "someone@example.com",
  restricted: "Y",
  gpDetails: {
    name: "GP name",
    address: "GP address",
    postcode: "N1 1TU",
    phoneNumber: "012349545",
    email: "gp@test.com",
  },
  firstLanguage: "English",
}
