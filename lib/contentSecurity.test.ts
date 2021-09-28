import {generateCSP, generateNonce} from "./contentSecurity";

beforeAll(() => jest.spyOn(global.Math, 'random').mockReturnValue(0.123456789));
afterAll(() => jest.spyOn(global.Math, 'random').mockRestore());


describe('generating a nonce value', () => {
  test('creates a random string', () => {
    expect(generateNonce()).toBe('4fzzzxjylrx4fzzzxjylrx4fzzzxjylrx4fzzzxjylrx4fzzzxjylrx')
  });
});

describe('generate a basic content security header', () => {
  test('generates a basic csp header', () => {
    expect(generateCSP({'default-src': ["'self'"]})).toBe("default-src 'self';");
  });

  test('generates a basic csp header with custom default sources', () => {
    expect(generateCSP({'default-src': ["'self'", '*.hackney.gov.uk', 'hackney.gov.uk']}))
      .toBe("default-src 'self' *.hackney.gov.uk hackney.gov.uk;");
  });
});
