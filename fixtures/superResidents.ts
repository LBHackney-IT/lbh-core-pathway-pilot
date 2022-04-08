import { SuperResident } from "../components/ResidentDetailsList.types"

export const mockSuperResident: SuperResident = {
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
    sexualOrientation: "Prefer not to say",
    keyContacts: [{name: "Frank", email:"firstname.surname@example.com"}, {name: "someone", email: "test@example.com"}],
    techUse: ["Word", "Powerpoint"],
    dateOfBirth: "2000-10-01",
    ethnicity: "A.A12",
    phoneNumbers: [{number: "0123456778", type: "mobile"}],
    contextFlag: "A",
    createdBy: "someone@example.com",
    restricted: 'Y',
    gpDetails: {name: "GP name",
      address: "GP address",
      postcode: "N1 1TU",
      phoneNumber: "012349545",
      email: "gp@test.com",}
}
