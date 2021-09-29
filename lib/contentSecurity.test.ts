import {generateCSP, generateNonce} from "./contentSecurity";

beforeAll(() => jest.spyOn(global.Math, 'random').mockReturnValue(0.123456789));
afterAll(() => jest.spyOn(global.Math, 'random').mockRestore());

describe('generating a nonce value', () => {
  test('creates a random string', () => {
    expect(generateNonce()).toBe('4fzzzxjylrx4fzzzxjylrx4fzzzxjylrx4fzzzxjylrx4fzzzxjylrx')
  });
});

describe('generating the desired CSP from a nonce', () => {
  test('generates the expected CSP header', () => {
    expect(generateCSP(generateNonce())).toBe(
      "default-src 'self'; " +
      "style-src 'self' 'nonce-4fzzzxjylrx4fzzzxjylrx4fzzzxjylrx4fzzzxjylrx4fzzzxjylrx'; " +
      "style-src-elem 'self' 'nonce-4fzzzxjylrx4fzzzxjylrx4fzzzxjylrx4fzzzxjylrx4fzzzxjylrx' fonts.googleapis.com; " +
      "script-src 'self' 'nonce-4fzzzxjylrx4fzzzxjylrx4fzzzxjylrx4fzzzxjylrx4fzzzxjylrx'; " +
      "script-src-elem 'self' 'nonce-4fzzzxjylrx4fzzzxjylrx4fzzzxjylrx4fzzzxjylrx4fzzzxjylrx'; " +
      "font-src 'self' fonts.gstatic.com; " +
      "frame-ancestors 'self'; " +
      "form-action 'self';"
    );
  });
});
