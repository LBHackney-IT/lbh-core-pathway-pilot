import {JsonWebTokenError, JwtPayload, TokenExpiredError, verify} from 'jsonwebtoken';

export const SESSION_EXPIRY = 14400;

export interface HackneyTokenPayload extends JwtPayload {
  email: string;
  name: string;
  groups: Array<string>;
  issuedAt: Date;
}

export interface HackneyToken {
  email: string;
  name: string;
  subject: string;
  issuer: string;
  groups: Array<string>;
  issuedAt: Date;
}

export class AuthError extends Error {
}

export class TokenNotVerified extends AuthError {
}

export class TokenExpired extends AuthError {
}

export const decodeToken = (token: string): HackneyToken => {
  try {
    const jwt = <HackneyTokenPayload>verify(
      token,
      process.env.HACKNEY_AUTH_TOKEN_SECRET,
      {maxAge: SESSION_EXPIRY}
    );

    return {
      email: jwt.email.toLowerCase(),
      groups: jwt.groups,
      issuedAt: unixToDate(jwt.iat),
      issuer: jwt.iss,
      name: jwt.name,
      subject: jwt.sub,
    };
  } catch (e) {
    switch (e.constructor) {
      case TokenExpiredError:
        throw new TokenExpired(e.message);
      case JsonWebTokenError:
        throw new TokenNotVerified(e.message);
    }
  }
}

const unixToDate = (timestamp: number) => new Date(timestamp * 1000);
