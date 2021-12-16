import {sign} from "jsonwebtoken";
import {pilotGroup} from "../../config/allowedGroups";

export const dateToUnix = (date) => Math.floor(date.getTime() / 1000);

export const makeToken = (
  {
    sub = '49516349857314',
    email = 'test@example.com',
    iss = 'Hackney',
    name = 'example user',
    groups = ['test-group'],
    iat = new Date(),
  }
) => sign(
  {sub, email, iss, name, groups, iat: dateToUnix(iat)},
  Cypress.env("HACKNEY_AUTH_TOKEN_SECRET"),
);

const mockUserToken = makeToken({
  email: 'fake.user@hackney.gov.uk',
  groups: [pilotGroup],
});
const mockApproverToken = makeToken({
  email: 'fake.approver@hackney.gov.uk',
  groups: [pilotGroup],
});

const mockPanelApproverToken = makeToken({
  email: 'fake.panel.approver@hackney.gov.uk',
  groups: [pilotGroup],
});


Cypress.Commands.add("visitAsUser", (...args) => {
  cy.setCookie(Cypress.env("HACKNEY_AUTH_COOKIE_NAME"), mockUserToken)
  cy.getCookie(Cypress.env("HACKNEY_AUTH_COOKIE_NAME")).should(
    "have.property",
    "value",
    mockUserToken,
  )
  cy.visit(...args)
})

Cypress.Commands.add("visitAsApprover", (...args) => {
  cy.setCookie(Cypress.env("HACKNEY_AUTH_COOKIE_NAME"), mockApproverToken)
  cy.getCookie(Cypress.env("HACKNEY_AUTH_COOKIE_NAME")).should(
    "have.property",
    "value",
    mockApproverToken,
  )
  cy.visit(...args)
})

Cypress.Commands.add("visitAsPanelApprover", (...args) => {
  cy.setCookie(Cypress.env("HACKNEY_AUTH_COOKIE_NAME"), mockPanelApproverToken)
  cy.getCookie(Cypress.env("HACKNEY_AUTH_COOKIE_NAME")).should(
    "have.property",
    "value",
    mockPanelApproverToken,
  )
  cy.visit(...args)
})
