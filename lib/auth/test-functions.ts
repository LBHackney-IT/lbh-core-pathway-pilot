import {sign} from "jsonwebtoken";

export const dateToUnix = (date: Date): number => Math.floor(date.getTime() / 1000);

interface MakeTokenInput {
  sub?: string;
  email?: string
  iss?: string;
  name?: string;
  groups?: Array<string>;
  iat?: Date,
}

export const makeToken = (
  {
    sub = '49516349857314',
    email = 'test@example.com',
    iss = 'Hackney',
    name = 'example user',
    groups = ['test-group'],
    iat = new Date(),
  }: MakeTokenInput
): string => sign(
  {sub, email, iss, name, groups, iat: dateToUnix(iat)},
  process.env.HACKNEY_JWT_SECRET,
);
