import jwt from "jsonwebtoken"
import { pilotGroup } from "../../config/allowedGroups"

const inPilotGroupJWTToken = jwt.sign(
  {
    groups: [pilotGroup],
  },
  Cypress.env("HACKNEY_JWT_SECRET")
)

Cypress.Commands.add("visitAsUser", (...args) => {
  cy.setCookie(Cypress.env("GSSO_TOKEN_NAME"), inPilotGroupJWTToken)
  cy.getCookie(Cypress.env("GSSO_TOKEN_NAME")).should(
    "have.property",
    "value",
    inPilotGroupJWTToken
  )
  cy.setCookie("next-auth.session-token", "test-token")
  cy.getCookie("next-auth.session-token").should(
    "have.property",
    "value",
    "test-token"
  )
  cy.visit(...args)
})

Cypress.Commands.add("visitAsApprover", (...args) => {
  cy.setCookie(Cypress.env("GSSO_TOKEN_NAME"), inPilotGroupJWTToken)
  cy.getCookie(Cypress.env("GSSO_TOKEN_NAME")).should(
    "have.property",
    "value",
    inPilotGroupJWTToken
  )
  cy.setCookie("next-auth.session-token", "test-approver-token")
  cy.getCookie("next-auth.session-token").should(
    "have.property",
    "value",
    "test-approver-token"
  )
  cy.visit(...args)
})

Cypress.Commands.add("visitAsPanelApprover", (...args) => {
  cy.setCookie(Cypress.env("GSSO_TOKEN_NAME"), inPilotGroupJWTToken)
  cy.setCookie("next-auth.session-token", "test-panel-approver-token")
  cy.getCookie("next-auth.session-token").should(
    "have.property",
    "value",
    "test-panel-approver-token"
  )
  cy.visit(...args)
})
