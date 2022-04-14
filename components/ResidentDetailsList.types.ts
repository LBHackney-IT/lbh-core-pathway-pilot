
export interface GPDetails {
  name: string;
  address: string;
  postcode: string;
  phoneNumber: string;
  email: string;
}

export interface KeyContact {
  name: string;
  email: string;
}

export interface FullResident {
  id: number;

  //  names
  title?: string;
  firstName: string;
  lastName: string;
  otherNames: OtherName[];

  // sex & gender
  gender: string;
  pronoun?: string;
  genderAssignedAtBirth?: boolean;
  sexualOrientation?: string;

  // languages
  firstLanguage?: string;
  preferredLanguage?: string;
  fluentInEnglish?: boolean;
  interpreterNeeded?: boolean;

  // key contacts
  keyContacts?: KeyContact[];

  // communication
  communicationDifficulties?: boolean;
  difficultyMakingDecisions?: boolean;
  communicationDifficultiesDetails?: string; // TODO use this!?

  // further biographical info
  techUse?: string[];
  dateOfBirth?: string;
  dateOfDeath?: string;
  ethnicity?: string;
  religion?: string;
  employment?: string;
  maritalStatus?: string;
  immigrationStatus?: string;
  careProvider?: string;

  // housing
  livingSituation?: string;
  tenureType?: string;
  accomodationType?: string;
  accessToHome?: string;
  housingOfficer?: string;
  housingStaffInContact?: boolean;
  cautionaryAlert?: boolean;
  possessionEvictionOrder?: string;
  rentRecord?: string;
  housingBenefit?: string;
  councilTenureType?: string;
  tenancyHouseholdStructure?: string;

  // medical & disability
  nhsNumber?: number;
  gpDetails?: GPDetails;
  disabilities?: string[];
  mentalHealthSectionStatus?: string;
  deafRegister?: string;
  blindRegister?: string;
  blueBadge?: boolean;

  // contact details
  address?: Address;
  phoneNumbers: PhoneNumber[];
  // emails: string[];
  preferredMethodOfContact?: string;
  emailAddress?: string;

  // permissions and metadata
  primarySupportReason?: string;
  allocatedTeam?: string;
  openCase?: boolean;
  contextFlag: AgeContext;
  restricted?: 'Y' | 'N';
  createdBy: string;
  lastUpdated?: {
    [key: string]: string;
  };

  /** @deprecated legacy stuff — avoid using these */
  ageContext?: AgeContext;
  addresses?: LegacyAddress[];
}

export type AgeContext = 'A' | 'B' | 'C' | undefined;

export interface LegacyAddress {
  addressLines: string;
  postCode: string;
  uprn?: string;
  isDisplayAddress?: string;
}

export interface PhoneNumber {
  number: string;
  type: string;
}

export interface OtherName {
  firstName: string;
  lastName: string;
}


export interface Address {
  address: string;
  postcode: string;
  uprn?: string;
}
