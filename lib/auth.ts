import {verify} from 'jsonwebtoken';

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

export const decodeToken = (token: string): HackneyToken => {
  try {
    verify(token, process.env.HACKNEY_JWT_SECRET)
  } catch (e) {
    throw new TokenVerifyFailed(e.message);
  }

  return {
    email: "",
    groups: undefined,
    issuedAt: undefined,
    issuer: "",
    name: "",
    subject: "",
  };
}
