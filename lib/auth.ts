import {verify} from 'jsonwebtoken';

export const SESSION_EXPIRY = 14400;

export interface HackneyToken {
  email: string;
  name: string;
  subject: string;
  issuer: string;
  groups: Array<string>;
  issuedAt: Date;
}

export class AuthError extends Error {}
export class TokenVerifyFailed extends AuthError {}
export class TokenExpired extends AuthError {}

export const decodeToken = (token: string): HackneyToken => {
  let jwt;

  try {
    jwt = verify(token, process.env.HACKNEY_JWT_SECRET);
  } catch (e) {
    throw new TokenVerifyFailed(e.message);
  }

  if (isExpired(jwt)) throw new TokenExpired();

  return {
    email: jwt.email,
    groups: jwt.groups,
    issuedAt: unixToDate(jwt.iat),
    issuer: jwt.iss,
    name: jwt.name,
    subject: jwt.sub,
  };
}

const isExpired = ({iat}) => dateToUnix(new Date()) - SESSION_EXPIRY > iat;
const dateToUnix = (date: Date) => Math.floor(date.getTime() / 1000);
const unixToDate = (timestamp: number) => new Date(timestamp * 1000);
