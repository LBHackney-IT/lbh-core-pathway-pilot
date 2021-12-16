import { Resident } from "../types"

export const mockResident: Resident = {
  mosaicId: "123",
  firstName: "Resident Firstname",
  lastName: "Resident Surname",
  gender: "X",
  nhsNumber: "12345678",
  restricted: "Y",
  phoneNumber: [
    { phoneNumber: "020 777 7777", phoneType: "Home" },
    { phoneNumber: "0777 777 7777", phoneType: "Mobile" },
  ],
  ageContext: "C",
  dateOfBirth: "2000-10-01",
  nationality: "British",
  uprn: "abcd",
  addressList: [
    {
      addressLine1: "123 Town St",
      addressLine2: "Citythorpe",
      postCode: "W1A",
    },
  ],
  ethnicity: "C.C11",
  firstLanguage: "English",
  religion: "None",
  sexualOrientation: "Prefer not to say",
  emailAddress: "firstname.surname@example.com",
  preferredMethodOfContact: "Email",
  otherNames: [{ firstName: "Jane", lastName: "Doe" }],
}
