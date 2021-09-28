export type CSPDirective =
  'default-src'|
  'connect-src'|
  'style-src'|
  'script-src'|
  'font-src'|
  'style-src-elem'|
  'script-src-elem';

export type CSPPolicy = {
  [key in CSPDirective]?: Array<string>;
};

export type CSPHeader = {
  [key in CSPDirective]?: Array<string>;
};

export const generateNonce = (): string =>
  (new Array(5).fill(null))
    .map(() => Math.random().toString(36).substring(2))
    .join('');

export const generateCSP = (policy: CSPPolicy = null): string => {
  const header: CSPHeader = {};

  if (policy) {
    Object.entries(policy).forEach(([directive, values]) => {
      if (!header[directive]) header[directive] = [];

      header[directive] = header[directive].concat(values);
    })
  }

  return Object.entries(header)
    .map(([directiveName, directiveValues]) => directiveName + ' ' + directiveValues.join(' '))
    .map(c => `${c};`).join(' ');
}
